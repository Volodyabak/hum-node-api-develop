import {
  GET_ARTIST_BRACKHITS_CONTAINING_ARTISTS,
  GET_BRACKHIT_CHOICES,
  GET_BRACKHIT_CHOICES_WITH_VOTES,
  GET_BRACKHIT_LEADERBOARD,
  GET_BRACKHIT_LEADERBOARD_OWNER,
  GET_BRACKHIT_WITH_ONE_ARTIST,
  GET_BRACKHITS_HOT_TAKES,
  GET_INSTANT_BRACKHIT_BY_ID,
  GET_TRACK_BRACKHITS_CONTAINING_ARTISTS,
} from '../../Queries';
import Tools from '../../Tools';
import { TrackService } from '../Track/TrackService';
import { ArtistService } from '../Artist/ArtistService';
import { db } from '../../../database/knex';
import { BrackhitUtils } from './BrackhitUtils';
import { BrackhitUserModel } from '../../../database/Models/BrackhitUserModel';
import { BRACKHIT_SORTING_ID, BrackhitModel } from '../../../database/Models/BrackhitModel';
import { BrackhitMatchupsModel } from '../../../database/Models/BrackhitMatchupsModel';
import { BrackhitUserChoicesModel } from '../../../database/Models/BrackhitUserChoicesModel';
import { AppSettingsService } from '../AppSettings/AppSettingsService';
import { NotFoundError } from '../../Errors';
import { ErrorConst } from '../../Errors/ErrorConst';
import { CentralFeedModel } from '../../../database/Models';
import {
  BrackhitScoringState,
} from '../../modules/brackhits/constants/brackhits.constants';
import { BrackhitsUtils } from '../../modules/brackhits/utils/brackhits.utils';
import { expr } from '../../../database/relations/relation-builder';
import { Relations } from '../../../database/relations/relations';
import { BrackhitWithDuplicateTracksCount } from '../../modules/brackhits/interfaces/brackhits.interface';
import { QueryBuilderUtils } from '../../Tools/utils/query-builder.utils';
import { JoinOperation } from '../../Tools/dto/util-classes';
import { ConstantsModel } from '../../../database/Models/ConstantsModel';
import { ConstantId } from '../../modules/constants/constants';
import { FeedSources } from '../../modules/feed/constants/feed.constants';
import { createBrackhit, createBrackhitContentArtistTrack, createOrUpdateBrackhitContent } from 'src/KnexQueries/BrackhitKnexQueries';

const BRACKHIT_ARTIST_TRACK_COUNT = 4;
const ALL_BRACKHIT_ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

class BrackhitsServiceExpress {
  private utils: BrackhitUtils;

  constructor() {
    this.utils = new BrackhitUtils();
  }

  async getBrackhit(brackhitId) {
    const brackhit = await BrackhitModel.query().findById(brackhitId);
    if (!brackhit) {
      throw new NotFoundError(ErrorConst.BRACKHIT_NOT_FOUND);
    }
    return brackhit;
  }

  async getBrackhitWithOwner(brackhitId) {
    const brackhitQB = BrackhitModel.query().findById(brackhitId);

    QueryBuilderUtils.fetchRelationsToBuilder(brackhitQB, [
      {
        relation: Relations.Owner,
        alias: 'upi',
        select: ['upi.*', 'ui.typeId as influencerType'],
        children: [
          {
            relation: expr([Relations.UserInfluencer, 'ui']),
            join: JoinOperation.leftJoin,
          },
        ],
      },
    ]);

    return brackhitQB;
  }

  async getBrackhitChoices(brackhitId, withVotes = false) {
    if (withVotes) {
      const completions = await this.getBrackhitCompletions(brackhitId);
      if (completions >= this.utils.minBrackhitCompletions) {
        const choices = await Tools.promisifiedQuery(
          GET_BRACKHIT_CHOICES_WITH_VOTES,
          {
            brackhitId,
          },
          'BrackhitsService getBrackhitChoices() GET_BRACKHIT_CHOICES_WITH_VOTES Error: ',
        );

        return this.joinContentMetaToBrackhitChoices(brackhitId, choices);
      }
    }

    const choices = await Tools.promisifiedQuery(
      GET_BRACKHIT_CHOICES,
      {
        brackhitId,
      },
      'BrackhitsService getBrackhitChoices() GET_BRACKHIT_CHOICES Error: ',
    );

    return this.joinContentMetaToBrackhitChoices(brackhitId, choices);
  }

  async getBrackhitLeaderboardOwner(brackhitId, tokenUserId, ownerId) {
    const [owner] = await Tools.promisifiedQuery(
      GET_BRACKHIT_LEADERBOARD_OWNER,
      {
        brackhitId,
        tokenUserId,
        ownerId,
      },
      'BrackhitsService getBrackhitLeaderboardOwner() GET_BRACKHIT_LEADERBOARD_OWNER Error: ',
    );

    return owner;
  }

  async getBrackhitLeaderboardData(brackhitId, tokenUserId, skip = 0, take = 20) {
    const [brackhit, leaderboard] = await Promise.all([
      this.getBrackhitWithOwner(brackhitId),
      this.getBrackhitLeaderboard(brackhitId, tokenUserId, skip, take),
    ]);

    if (skip === 0) {
      const owner = await this.getBrackhitLeaderboardOwner(
        brackhitId,
        tokenUserId,
        brackhit.ownerId,
      );
      // removes owner from leaderboard if present and sets it as a first array element,
      if (owner) {
        const ownerIndex = leaderboard.findIndex((el) => el.userId === owner.userId);
        if (ownerIndex >= 0) {
          leaderboard.splice(ownerIndex, 1);
        }
        leaderboard.unshift(owner);
      }
    }

    let prevScore = -1;
    leaderboard.forEach((user, index) => {
      user.rank = user.score !== prevScore ? index + 1 : '-';
      prevScore = user.score;
      // return this.userService.signProfileImageUrl(user);
    });

    return leaderboard;
  }

  async getBrackhitLeaderboard(brackhitId, tokenUserId, skip = 0, take = 20) {
    return Tools.promisifiedQuery(
      GET_BRACKHIT_LEADERBOARD,
      {
        brackhitId,
        tokenUserId,
        skip,
        take,
      },
      'BrackhitsService getBrackhitLeaderboard() GET_BRACKHIT_LEADERBOARD Error: ',
    );
  }

  async updateBrackhitChoice({ userId, brackhitId, roundId, choiceId }) {
    return BrackhitUserChoicesModel.query()
      .insertAndFetch({
        userId,
        brackhitId,
        roundId,
        choiceId,
      })
      .onConflict()
      .merge(['choiceId']);
  }

  async getUserBrackhit(userId: string, brackhitId: number) {
    return BrackhitUserModel.query().withGraphFetched('[brackhit]').findById([userId, brackhitId]);
  }

  async createUserBrackhit(userId, brackhitId) {
    return BrackhitUserModel.query().insertAndFetch({
      userId,
      brackhitId,
      isComplete: 0,
    });
  }

  async isLiveBrackhit(brackhitId, date) {
    // it's easier to check whether the brackhit is instant rather than live,
    // query doesn't return anything if the brackhit is live
    const [brackhit] = await Tools.promisifiedQuery(
      GET_INSTANT_BRACKHIT_BY_ID,
      {
        brackhitId,
        date,
      },
      'Brackhits Service isLiveBrackhit() GET_INSTANT_BRACKHIT_BY_ID Error: ',
    );

    return !brackhit;
  }

  async getBrackhitsContainingArtist(artistIds, userTime) {
    if (artistIds.length === 0) return [];

    const [trackBrackhits, artistBrackhits] = await Promise.all([
      this.getTrackBrackhitsContainingArtists(artistIds, userTime),
      this.getArtistBrackhitsContainingArtists(artistIds, userTime),
    ]);

    return trackBrackhits.concat(artistBrackhits);
  }

  async getArtistBrackhitsContainingArtists(artistIds, userTime) {
    return Tools.promisifiedQuery(
      GET_ARTIST_BRACKHITS_CONTAINING_ARTISTS,
      {
        artistIds: [artistIds],
        userTime,
      },
      'BrackhitsService getArtistBrackhitsContainingArtists() GET_ARTIST_BRACKHITS_CONTAINING_ARTISTS Error: ',
    );
  }

  async getTrackBrackhitsContainingArtists(artistIds, userTime) {
    return Tools.promisifiedQuery(
      GET_TRACK_BRACKHITS_CONTAINING_ARTISTS,
      {
        artistIds: [artistIds],
        userTime,
        contentCount: BRACKHIT_ARTIST_TRACK_COUNT,
      },
      'BrackhitsService getTrackBrackhitsContainingArtists() GET_TRACK_BRACKHITS_CONTAINING_ARTISTS Error: ',
    );
  }

  async getContentMeta(brackhitId, type, contentIds) {
    if (this.utils.isTrackBrackhit(type)) {
      const [withAlbumName, settings] = await Promise.all([
        this.isBrackhitWithOneArtist(brackhitId),
        AppSettingsService.getAppSettingsState(),
      ]);

      return Promise.all(
        contentIds.map(async (trackId) =>
          TrackService.getTrackInfo(trackId, settings, withAlbumName),
        ),
      );
    } else if (this.utils.isArtistBrackhit(type)) {
      // consider replacing this code with promise chaining in case of performance issues
      // since using async await inside a map is inefficient
      return Promise.all(
        contentIds.map(async (artistId) => {
          const [profile, trackKey] = await Promise.all([
            ArtistService.getArtistProfile(artistId),
            ArtistService.getArtistTrackKey(brackhitId, artistId),
          ]);
          return {
            ...profile,
            trackKey,
          };
        }),
      );
    } else {
      return [];
    }
  }

  async joinContentMetaToBrackhitChoices(brackhitId, choices) {
    if (choices?.length) {
      const content = await this.getContentMeta(
        brackhitId,
        choices[0].type,
        choices.map((el) => el.contentId),
      );
      return choices.map((choice, index) => ({
        ...choice,
        content: content[index],
      }));
    }
    return [];
  }

  async validateBrackhit({ name, duration, timeLive, displaySeeds, sortingId, tracks }) {
    const errors = [];

    if (name?.length < 1) {
      errors.push('Brackhit name must be at least 1 character long');
    }

    if (duration < 0) {
      errors.push('Brackhit duration must be greater or equal zero');
    }

    if (timeLive && new Date(timeLive).getTime() < Date.now()) {
      errors.push('The start date is before the current time');
    }

    if (![0, 1].includes(displaySeeds)) {
      errors.push('displaySeeds should be equal 0 or 1');
    }

    if (!Object.values(BRACKHIT_SORTING_ID).includes(sortingId)) {
      errors.push('Wrong sortingId value');
    }

    if (!tracks) {
      errors.push('No content submitted');
    }

    // todo: fix this error
    // if (tracks.length >= BrackhitSize._2 && tracks.length <= BrackhitSize._64) {
    //   errors.push('The Brackhit needs to have either 2, 4, 8, 16, 32 or 64 choices');
    // }

    const existingName = await db('labl.brackhit').select('name').where({ name }).first();

    if (existingName) {
      errors.push('A brackhit already exists with the given name');
    }

    const trackIds = tracks.map((el) => el.id);
    const brackhit = await BrackhitMatchupsModel.query()
      .alias('bm')
      .select('b.size')
      .count('* as duplicates')
      .joinRelated(expr([Relations.Brackhit, 'b']))
      .leftJoinRelated('[brackhitContent as bc.[track as st]]')
      .whereIn('bc:st.id', trackIds)
      .groupBy('bm.brackhitId')
      .orderByRaw('duplicates DESC')
      .first()
      .castTo<BrackhitWithDuplicateTracksCount>();

    if (brackhit && brackhit.duplicates === brackhit.size) {
      errors.push('A brackhit already exists with the given input');
    }

    return errors;
  }

  async createBrackhit({
    type,
    tracks,
    name,
    playlistKey,
    ownerId,
    description,
    timeLive,
    duration,
    thumbnail,
    displaySeeds,
    sortingId,
    size,
  }) {
    let contentType = this.utils.brackhitTypeId.TRACK;
    const brackhitSize = size || tracks.length;
    if (type === 4 || type === 2) contentType = this.utils.brackhitTypeId.ARTIST;

    const startingRound = BrackhitsUtils.getStartingRound(brackhitSize);

    const brackhit = await createBrackhit({
      typeId: contentType,
      name,
      description,
      ownerId,
      timeLive,
      duration,
      size: brackhitSize,
      thumbnail,
      scoringState: BrackhitScoringState.IN_PROGRESS,
      playlistKey,
      displaySeeds,
      sortingId,
      startingRound,
    });

    await Promise.all([
      BrackhitModel.query().updateAndFetchById(brackhit.brackhitId, {
        url: BrackhitsUtils.getBrackhitUrl(brackhit.brackhitId),
      }),
      CentralFeedModel.query().insertAndFetch({
        feedSource: FeedSources.Brackhit,
        sourceId: brackhit.brackhitId,
      }),
    ]);

    const seeds = this.utils.seeding(brackhitSize);

    await Promise.all(
      tracks.slice(0, size).map(async (el, index) => {
        const choice = await createOrUpdateBrackhitContent(contentType, el.id);
        const seed = brackhitSize === 16 ? this.utils.getSeedForTrackIndex(index) : seeds[index];
        await this.createMatchups(brackhit.brackhitId, choice.choiceId, seed, index, startingRound);
        // todo: check if this is needed?
        if (contentType === 2) {
          await createBrackhitContentArtistTrack(
            brackhit.brackhitId,
            choice.choiceId,
            el.id,
          );
        }
      }),
    );

    return brackhit;
  }

  async createMatchups(brackhitId, choiceId, seed, index, startingRound) {
    const roundId = startingRound + Math.floor(index / 2);

    await db('labl.brackhit_matchups')
      .insert({
        brackhitId,
        choiceId,
        seed,
        roundId,
      })
      .onConflict()
      .merge();
  }

  async isBrackhitWithOneArtist(brackhitId) {
    const [brackhit] = await Tools.promisifiedQuery(
      GET_BRACKHIT_WITH_ONE_ARTIST,
      {
        brackhitId,
      },
      'BrackhitsService isBrackhitWithOneArtist() GET_BRACKHIT_WITH_ONE_ARTIST error: ',
    );

    return !!brackhit;
  }

  async getBrackhitsHotTakes(take: number) {
    const hotTakes = await Tools.promisifiedQuery(
      GET_BRACKHITS_HOT_TAKES,
      {
        minCompletions: this.utils.minHotTakeCompletions,
        voteShare: this.utils.hotTakeVoteShare,
        take,
      },
      'BrackhitsService getBrackhitsHotTakes() GET_BRACKHITS_HOT_TAKES error: ',
    );

    const settings = await AppSettingsService.getAppSettingsState();

    await Promise.all(
      hotTakes.map(async (elem) => {
        await TrackService.joinContentMetaToHotTake(elem, settings);
        // await UserService.signProfileImageUrl(elem);
      }),
    );

    return hotTakes;
  }

  async getBrackhitCompletions(brackhit_id) {
    const result = await db('labl.brackhit_user')
      .sum({ total: 'is_complete' })
      .where({ brackhit_id })
      .first();
    return result.total;
  }

  async getBrackhitVotes(brackhitId, roundId) {
    const requiredRounds = roundId ? [roundId] : ALL_BRACKHIT_ROUNDS;

    return db({ bm: 'labl.brackhit_matchups' })
      .select('buc.round_id', 'bm.choice_id', db.raw('COUNT(*) as votes'))
      .leftJoin({ buc: 'labl.brackhit_user_choices' }, function () {
        this.on('buc.brackhit_id', 'bm.brackhit_id').andOn('buc.choice_id', 'bm.choice_id');
      })
      .join({ bu: 'labl.brackhit_user' }, function () {
        this.on('bu.brackhit_id', 'buc.brackhit_id').andOn('bu.user_id', 'buc.user_id');
      })
      .where('bm.brackhit_id', brackhitId)
      .andWhere('bu.is_complete', 1)
      .whereIn('buc.roundId', requiredRounds)
      .groupBy('buc.round_id', 'bm.choice_id');
  }

  async deleteBrackhit(brackhitId) {
    return BrackhitModel.query().deleteById(brackhitId);
  }

  async sortBrackhitsByCompletions(brackhitIds, take = Number.MAX_SAFE_INTEGER) {
    return BrackhitModel.query()
      .alias('b')
      .leftJoin('labl.brackhit_user as bu', 'bu.brackhitId', 'b.brackhitId')
      .whereIn('b.brackhitId', brackhitIds)
      .groupBy('b.brackhitId')
      .orderByRaw('SUM(bu.is_complete) DESC')
      .limit(take);
  }

  async getUserBrackhitScore(userId, brackhitId) {
    let userScore = await db('labl.brackhit_user_score')
      .where({
        user_id: userId,
        brackhit_id: brackhitId,
      })
      .first();

    if (!userScore) {
      userScore = {
        brackhitId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        bin: null,
      };
    }

    const constant = await ConstantsModel.query().findById(ConstantId.BRACKHIT_COMPLETED_XP);
    userScore.score = constant.value;

    return userScore;
  }
}

const instance = new BrackhitsServiceExpress();
export { instance as BrackhitsServiceExpress };
