import { Injectable } from '@nestjs/common';
import UAParser from 'ua-parser-js';
import { db } from '@database/knex';
import {
  GET_BALLOT_TOP_ANSWERS,
  GET_BRACKHIT_TOP_ANSWERS,
  GET_TRAFFIC_SOURCE,
  GET_TRIVIA_TOP_ANSWERS,
  GET_USERS_BY_REGIONS,
  GET_VISITORS_AND_SUBMISSIONS_BY_DATE,
} from '../queries/analytics.queries';
import {
  CampaignSummaryOutput,
  DeviceDataOutput,
  TrafficRegionsOutput,
  UserOutput,
} from '../dto/output/analytics';
import { CampaignServiceV2 } from './campaign.service.v2';
import {
  CAMPAIGN_ID_NAME,
  CAMPAIGN_TYPE_ID,
  CAMPAIGN_TYPE_NAME,
} from '../constants/campaign.constants';
import { CommonQueryDto } from '../../../common/dto/query/query.dto';
import { parseCommonDtoKnex } from '../../../common/query/filters';
import { BrackhitsService } from '../../brackhits/services/brackhits.service';
import { BallotsService } from '../../ballots/services/ballots.service';
import { TriviaServiceV2 } from '../../trivia/services/trivia.service.v2';
import { formatChoiceResponse } from '../../games/utils/format-game.utils';
import { CampaignSpotifyTopArtistsModel, CampaignSpotifyTopTracksModel } from '@database/Models';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';

@Injectable()
export class CampaignAnalyticsService {
  constructor(
    private readonly campaignService: CampaignServiceV2,
    private readonly brackhitsService: BrackhitsService,
    private readonly ballotsService: BallotsService,
    private readonly triviaService: TriviaServiceV2,
  ) {}

  async getCampaignSummary(campaignId: number): Promise<CampaignSummaryOutput> {
    const summary = await db('labl.campaign_summary_stats')
      .where({ campaign_id: campaignId })
      .first();

    return {
      uniqueVisitors: summary?.uniqueVisits ?? 0,
      averageSessionTime: summary?.avgEngagementTime ?? 0,
      submissions: summary?.submissions ?? 0,
      shares: summary?.shares ?? 0,
      referrals: summary?.referrals ?? 0,
      kFactor: summary?.kFactor ?? 0,
      productClicks: summary?.productClicks ?? 0,
      customButtonClicks: summary?.ctaClicks ?? 0,
    };
  }

  async getUsers(campaignId: number, query: CommonQueryDto): Promise<[UserOutput[], number]> {
    const campaign = await this.campaignService.findById(campaignId);

    let gameTable = '';
    if (campaign.typeId === CAMPAIGN_TYPE_ID.Brackhit) {
      gameTable = 'labl.campaign_user_brackhit as results';
    } else if (campaign.typeId === CAMPAIGN_TYPE_ID.Ballot) {
      gameTable = 'labl.campaign_user_ballot as results';
    } else if (campaign.typeId === CAMPAIGN_TYPE_ID.Trivia) {
      gameTable = 'labl.campaign_user_trivia as results';
    }

    const usersQB = db('labl.campaign_user_data as user_data')
      .select(
        'user_data.campaign_user_id as user_id',
        'user_data.campaign_id',
        db.raw("MAX(CASE WHEN user_data.attribute = 'NAME' THEN user_data.value END) as name"),
        db.raw("MAX(CASE WHEN user_data.attribute = 'EMAIL' THEN user_data.value END) as email"),
        db.raw("MAX(CASE WHEN user_data.attribute = 'PHONE' THEN user_data.value END) as phone"),
        db.raw("MAX(CASE WHEN user_data.attribute = 'ZIP' THEN user_data.value END) as zip"),
        db.raw(
          "MAX(CASE WHEN user_data.attribute = 'INSTAGRAM' THEN user_data.value END) as instagram",
        ),
        db.raw(
          "MAX(CASE WHEN user_data.attribute = 'COUNTRY' THEN user_data.value END) as country",
        ),
        db.raw("MAX(CASE WHEN user_data.attribute = 'REGION' THEN user_data.value END) as region"),
        db.raw("MAX(CASE WHEN user_data.attribute = 'CITY' THEN user_data.value END) as city"),
        'slug.name as slug',
        'results.score',
        'results.created_at as time_submitted',
      )
      .leftJoin(
        'labl.campaign_user_agents as user_agent',
        'user_data.campaign_user_id',
        'user_agent.campaign_user_id',
      )
      .leftJoin('labl.campaign_logs as log', 'user_agent.id', 'log.user_agent_id')
      .leftJoin('labl.campaign_slug as slug', 'log.slug_id', 'slug.id')
      .leftJoin(gameTable, function () {
        this.on('results.campaign_user_id', '=', 'user_data.campaign_user_id').andOn(
          'results.campaign_id',
          '=',
          'user_data.campaign_id',
        );
      })
      .where('user_data.campaign_id', campaignId)
      .whereNotNull('results.score')
      .groupBy('user_data.campaign_user_id');

    const totalQuery = db.count('* as total').from(usersQB.clone().as('users')).first();

    parseCommonDtoKnex(usersQB, query);

    const [users, { total }] = await Promise.all([usersQB, totalQuery as any]);
    return [users, total];
  }

  async getTrafficRegions(campaignId: number): Promise<TrafficRegionsOutput> {
    const [[siteVisits], [trafficSource], [usersByRegions]] = await Promise.all([
      db.raw(GET_VISITORS_AND_SUBMISSIONS_BY_DATE, { campaignId }),
      db.raw(GET_TRAFFIC_SOURCE, { campaignId }),
      db.raw(GET_USERS_BY_REGIONS, { campaignId }),
    ]);

    return {
      siteVisits:
        siteVisits?.map((el) => ({
          date: el.submission_date,
          uniqueSiteVisitors: el.unique_visitors,
          submissions: el.submissions,
        })) ?? [],
      trafficSource:
        trafficSource?.map((el) => ({
          source: el.name || 'Direct',
          users: el.users,
          percent: el.percentage,
        })) ?? [],
      usersByRegions: usersByRegions,
    };
  }

  async getDeviceData(campaignId: number): Promise<DeviceDataOutput> {
    const [userAgents] = await db.raw(
      `
        SELECT cua.user_agent
        FROM labl.campaign_user_link cul
               LEFT JOIN labl.campaign_user cu ON cul.user_id = cu.user_id
               LEFT JOIN labl.campaign_user_agents cua ON cua.campaign_user_id = cu.id
        WHERE cul.campaign_id = :campaignId
          AND cua.user_agent IS NOT NULL;
      `,
      { campaignId },
    );

    const parser = new UAParser();
    const parsedUA = userAgents.map(({ user_agent }) => parser.setUA(user_agent).getResult());

    const deviceType = {};
    const mobileOS = {};

    parsedUA.forEach((ua) => {
      const device = ua.device?.type ?? 'desktop';
      const os = ua.os.name;

      if (deviceType[device]) {
        deviceType[device].count += 1;
      } else {
        deviceType[device] = { count: 1, percent: 0 };
      }

      if (device === 'mobile') {
        if (mobileOS[os]) {
          mobileOS[os].count += 1;
        } else {
          mobileOS[os] = { count: 1, percent: 0 };
        }
      }
    });

    Object.keys(deviceType).forEach((key) => {
      const percent = deviceType[key].count / parsedUA.length;
      deviceType[key].percent = +percent.toFixed(2);
    });

    Object.keys(mobileOS).forEach((key) => {
      if (deviceType?.['mobile']?.count > 0) {
        const percent = mobileOS[key].count / deviceType['mobile'].count;
        mobileOS[key].percent = +percent.toFixed(2);
      }
    });

    return { deviceType, mobileOS };
  }

  async getQuizResults(campaignId: number) {
    const campaign = await this.campaignService.findById(campaignId);
    const type = CAMPAIGN_ID_NAME[campaign.typeId];
    let scoreDistribution;
    let topAnswers;

    // todo: ballots does not have score column
    let gameTable = '';
    if (type === CAMPAIGN_TYPE_NAME.Brackhit) {
      gameTable = 'labl.campaign_user_brackhit';
      topAnswers = await this.getBrackhitsTopAnswers(campaignId);
    } else if (type === CAMPAIGN_TYPE_NAME.Ballot) {
      topAnswers = await this.getBallotsTopAnswers(campaignId);
    } else if (type === CAMPAIGN_TYPE_NAME.Trivia) {
      gameTable = 'labl.campaign_user_trivia';
      topAnswers = await this.getTriviaTopAnswers(campaignId);
    }

    if (type !== CAMPAIGN_TYPE_NAME.Ballot) {
      scoreDistribution = await db(gameTable)
        .select('score')
        .count('* as count')
        .where('campaign_id', campaignId)
        .groupBy('score')
        .orderBy('score', 'asc');
    }

    return { type, scoreDistribution, topAnswers };
  }

  private async getBrackhitsTopAnswers(campaignId: number) {
    const [topAnswers] = await db.raw(GET_BRACKHIT_TOP_ANSWERS, { campaignId });

    if (topAnswers.length === 0) {
      return [];
    }

    const brackhitId = topAnswers[0].brackhitId;
    const choices = await this.brackhitsService.getBrackhitChoices(brackhitId);

    return topAnswers
      .map((answer) => {
        const choice = choices.find(
          (c) => c.roundId === answer.roundId && c.choiceId === answer.choiceId,
        );

        if (!choice) return null;

        return {
          roundId: answer.roundId,
          timeChosen: answer.timesChosen,
          type: choice.type,
          content: formatChoiceResponse(choice.type, choice),
        };
      })
      .filter(Boolean);
  }

  private async getBallotsTopAnswers(campaignId: number) {
    const [topAnswers] = await db.raw(GET_BALLOT_TOP_ANSWERS, { campaignId });

    if (topAnswers.length === 0) {
      return [];
    }

    const ballotId = topAnswers[0].ballotId;
    const { ballot } = await this.ballotsService.getBallot(ballotId);

    return topAnswers
      .map((answer) => {
        const round = ballot.categories.find((c) => c.roundId === answer.roundId);
        const choice = round.choices.find((c) => c.choiceId === answer.choiceId);

        if (!choice) return null;

        return {
          roundId: answer.roundId,
          bordaCount: answer.bordaCount,
          avgVoteRank: answer.avgVoteRank,
          votes: answer.votes,
          type: round.contentType.type,
          content: formatChoiceResponse(round.contentType.type, choice as any),
        };
      })
      .filter(Boolean);
  }

  private async getTriviaTopAnswers(campaignId: number) {
    const [topAnswers] = await db.raw(GET_TRIVIA_TOP_ANSWERS, { campaignId });

    if (topAnswers.length === 0) {
      return [];
    }

    const triviaId = topAnswers[0].triviaId;
    const trivia = await this.triviaService.findById(triviaId);
    await this.triviaService.populateTriviaContent(trivia);

    return topAnswers.map((answer) => {
      const round = trivia.rounds.find((r) => r.roundId === answer.roundId);
      const choice = round.question.choices.find((c) => c.choiceId === answer.choiceId);

      return {
        roundId: answer.roundId,
        timeChosen: answer.timesChosen,
        prompt: round.question.prompt,
        isCorrect: choice.isCorrect,
        type: choice.type,
        content: formatChoiceResponse(choice.type, choice),
      };
    });
  }

  async getTopSpotify(id: number) {
    const [artists, tracks] = await Promise.all([
      CampaignSpotifyTopArtistsModel.query()
        .withGraphFetched(expr([Relations.SpotifyArtist, [Relations.Artist, [Relations.Genres]]]))
        .where({ campaignId: id })
        .orderBy('score', 'desc'),
      CampaignSpotifyTopTracksModel.query()
        .withGraphFetched(expr([Relations.Track, [Relations.Artists, [Relations.Artist]]]))
        .where({ campaignId: id })
        .orderBy('score', 'desc'),
    ]);

    const result = {
      artists: {
        current: [],
        longTerm: [],
      },
      tracks: {
        current: [],
        longTerm: [],
      },
    };

    const artistScore = {
      Current: { score: 0, rank: 0 },
      'Long-Term': { score: 0, rank: 0 },
    };

    artists.forEach((artist) => {
      if (artist.score !== artistScore[artist.term].score) {
        artistScore[artist.term].score = artist.score;
        artistScore[artist.term].rank++;
      }

      const content = {
        id: artist.spotifyArtistId,
        rank: artistScore[artist.term].rank,
        name: artist.spotifyArtist?.artist?.facebookName,
        thumbnail: artist.spotifyArtist?.artist?.imageFile,
        genres: artist.spotifyArtist?.artist?.genres.map((g) => g.genreName),
      };

      if (artist.term === 'Current') {
        result.artists.current.push(content);
      } else if (artist.term === 'Long-Term') {
        result.artists.longTerm.push(content);
      }
    });

    const trackScore = {
      Current: { score: 0, rank: 0 },
      'Long-Term': { score: 0, rank: 0 },
    };

    tracks.forEach((track) => {
      if (track.score !== trackScore[track.term].score) {
        trackScore[track.term].score = track.score;
        trackScore[track.term].rank++;
      }

      const content = {
        id: track.spotifyTrackId,
        rank: trackScore[track.term].rank,
        name: track.track?.trackName,
        artists:
          track.track?.artists
            ?.map((a) => ({
              id: a.artist?.id,
              name: a.artist?.facebookName,
            }))
            .filter(Boolean) || [],
      };

      if (track.term === 'Current') {
        result.tracks.current.push(content);
      } else if (track.term === 'Long-Term') {
        result.tracks.longTerm.push(content);
      }
    });

    return result;
  }
}
