import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ErrorConst, RequestAppType, S3_TEMP_IMAGE_PREFIX } from '../../../constants';
import {
  ARTISTORY_NAME,
  BRACKHIT_CHOICES_MIN_COMPLETIONS,
  BrackhitContentType,
  BrackhitScoringState,
  BrackhitSize,
  BrackhitUserCompleteStatus,
  NOTIFY_OWNER_BRACKHIT_COMPLETIONS,
} from '../constants/brackhits.constants';
import { BrackhitsUtils } from '../utils/brackhits.utils';
import { BadRequestError, NotFoundError } from '../../../Errors';
import { BrackhitsCalculationService } from './brackhits-calculation.service';
import { BrackhitUserModel } from '@database/Models/BrackhitUserModel';
import { raw, Transaction } from 'objection';
import {
  BrackhitTagModel,
  BrackhitTagTypeModel,
  LogBrackhitResetsModel,
  LogContentModel,
  UserProfileInfoModel,
  UserSavedBrackhitsModel,
  UserSavedTracksModel,
} from '@database/Models';
import {
  BrackhitAdDto,
  BrackhitChoiceDto,
  BrackhitChoicesParams,
  BrackhitFtueDto,
  BrackhitResultDto,
  FinalRoundChoiceDto,
  HotTakeMetaDto,
  MasterChoiceDifferenceDto,
  SavedBrackhitDto,
  SavedTrackDto,
  SuggestedBrackhitDto,
  UserFriendBrackhitDto,
} from '../dto/brackhits.dto';
import {
  CompareMasterBrackhitResponseDto,
  GetBrackhitAdsResponseDto,
  GetBrackhitFriendsQueryDto,
  GetBrackhitFriendsResponseDto,
  GetBrackhitHotTakesQueryDto,
  GetBrackhitHotTakesResponseDto,
  GetBrackhitsArtistQueryDto,
  GetBrackhitsArtistResponseDto,
  GetBrackhitsByHubAndTagQueryDto,
  GetDailyStreakQueryDto,
  GetDailyStreakResponseDto,
  GetSavedBrackhitsQueryDto,
  GetSavedBrackhitsResponseDto,
  GetSavedTracksQueryDto,
  GetSavedTracksResponse,
  GetTagBrackhitsQueryDto,
  PutBrackhitUserChoiceParamDto,
  SaveBrackhitBodyDto,
  SaveTrackBodyDto,
  SearchBrackhitsQueryDto,
  UploadBrackhitImageResponse,
} from '../api-dto/brackhits-api.dto';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';
import { BrackhitsParser } from '../parsers/brackhits-parser';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import { AppSettingsService } from '../../../Services/AppSettings/AppSettingsService';
import { TracksService } from '../../tracks/services/tracks.service';
import { AppSettingsStateDto } from '../../app-settings/dto/app-settings.dto';
import { JoinOperation, PaginatedItems } from '../../../Tools/dto/util-classes';
import { S3Service } from '../../aws/services/s3.service';
import { getS3ImagePrefix } from '../../../Tools/utils/image.utils';
import { RepositoryService } from '../../repository/services/repository.service';
import { GetFriendsCompatibilityQueryDto } from '../../friends/dto/friends.dto';
import {
  BrackhitChoiceWithContent,
  BrackhitMetaParams,
  BrackhitWithSize,
  DailyBrackhitCompletion,
  SuggestBrackhitsParams,
  SuggestUserBrackhitsParams,
  TrackInfoParams,
} from '../interfaces/brackhits.interface';
import { v4 } from 'uuid';
import { BRACKHIT_SORTING_ID, BrackhitModel } from '@database/Models/BrackhitModel';
import { BrackhitResultsModel } from '@database/Models/BrackhitResultsModel';
import { BrackhitMatchupsModel } from '@database/Models/BrackhitMatchupsModel';
import { BrackhitUserChoicesModel } from '@database/Models/BrackhitUserChoicesModel';
import { BrackhitAnswerKeyModel } from '@database/Models/Brackhit/BrackhitAnswerKeyModel';
import { BrackhitContentTypeId } from '@database/Models/BrackhitContentTypeModel';
import { TransactionsService } from '../../../Services/Transactions/TransactionsService';
import { AppEventsEmitter } from '../../app-events/app-events.emitter';
import { AppEventName } from '../../app-events/app-events.types';
import { UsersService } from '../../users/services/users.service';
import { ConstantId } from '../../constants/constants';
import { BrackhitsHomeService } from './brackhits-home.service';
import { FeedSources } from '../../feed/constants/feed.constants';
import { InteractionTypes } from '../../analytics/constants';
import {
  BrackhitContentInput,
  BrackhitCustomContentInput,
  CreateBrackhitInput,
} from '../dto/brackhits.input';
import { PlaylistService } from '../../spotify/services/playlist.service';
import { BrackhitsContentService } from '../../brackhits-content/services/brackhits-content.service';
import { TrackInfoDto } from '../../tracks/tracks.dto';

@Injectable()
export class BrackhitsService {
  constructor(
    private readonly tracksService: TracksService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly brackhitsCalculationService: BrackhitsCalculationService,
    private readonly brackhitsHomeService: BrackhitsHomeService,
    private readonly repoService: RepositoryService,
    private readonly eventsEmitter: AppEventsEmitter,
    private readonly s3Service: S3Service,
    private readonly playlistService: PlaylistService,
    private readonly brackhitsContentService: BrackhitsContentService,
  ) {}

  async getBrackhitById(brackhitId: number): Promise<BrackhitModel> {
    const brackhit = await this.repoService.brackhitRepo.getBrackhitById(brackhitId);

    if (!brackhit) {
      throw new NotFoundError(ErrorConst.BRACKHIT_NOT_FOUND);
    }

    return brackhit;
  }

  async getBrackhitsMaster(brackhitId: number) {
    const brackhit = await BrackhitModel.query()
      .withGraphFetched(
        '[matchups.[brackhitContent.[contentType, artist, track.[album, artists]]], results.[choice.[contentType, artist, track.[album, artists]]]]',
      )
      .findOne({ brackhitId });

    if (!brackhit) {
      throw new NotFoundError(ErrorConst.BRACKHIT_NOT_FOUND);
    }

    if (brackhit.scoringState !== BrackhitScoringState.CALCULATED) {
      throw new BadRequestError(ErrorConst.BRACKHIT_RESULTS_ARE_NOT_READY);
    }

    const winnersWithPercent = BrackhitsUtils.getBrackhitWinnersWithPercent(
      brackhit,
      brackhit.matchups,
      brackhit.results,
    );

    return { ...brackhit, winners: winnersWithPercent };
  }

  // throws an error if brackhit is not completed
  async checkIfUserBrackhitIsCompleted(
    brackhitId: number,
    userId: string,
  ): Promise<BrackhitUserModel> {
    const userBrackhit = await this.repoService.userRepo.getUserBrackhit(brackhitId, userId);
    if (userBrackhit?.isComplete !== BrackhitUserCompleteStatus.COMPLETED) {
      throw new BadRequestError(ErrorConst.BRACKHIT_IS_NOT_COMPLETED);
    }

    return userBrackhit;
  }

  // throws an error if brackhit is completed
  async checkIfUserBrackhitIsNotCompleted(
    brackhitId: number,
    userId: string,
  ): Promise<BrackhitUserModel> {
    const userBrackhit = await this.repoService.userRepo.getUserBrackhit(brackhitId, userId);
    if (userBrackhit?.isComplete === BrackhitUserCompleteStatus.COMPLETED) {
      throw new BadRequestError(ErrorConst.BRACKHIT_IS_ALREADY_COMPLETED);
    }

    return userBrackhit;
  }

  async deleteUserBrackhitChoices(
    brackhitId: number,
    userId: string,
    trx?: Transaction,
  ): Promise<number> {
    return this.repoService.brackhitRepo.deleteUserBrackhitChoices(brackhitId, userId, trx);
  }

  async resetUserBrackhit(
    brackhitId: number,
    userId: string,
    trx?: Transaction,
  ): Promise<BrackhitUserModel> {
    const userBrackhit = await this.repoService.userRepo.getUserBrackhit(brackhitId, userId);
    return this.repoService.brackhitRepo.resetUserBrackhit(
      brackhitId,
      userId,
      userBrackhit.updatedAt,
      trx,
    );
  }

  async deleteUserBrackhitData(brackhitId: number, userId: string): Promise<void> {
    await Promise.all([
      await this.resetUserBrackhit(brackhitId, userId),
      await this.deleteUserBrackhitChoices(brackhitId, userId),
      await this.deleteUserBrackhitScore(brackhitId, userId),
      await this.logBrackhitResets(brackhitId, userId),
    ]);
    await this.brackhitsCalculationService.calculateBrackhitResults(brackhitId);
  }

  async deleteUserBrackhitScore(
    brackhitId: number,
    userId: string,
    trx?: Transaction,
  ): Promise<number> {
    return this.repoService.brackhitRepo.deleteUserBrackhitScore(brackhitId, userId, trx);
  }

  async logBrackhitResets(
    brackhitId: number,
    userId: string,
    trx?: Transaction,
  ): Promise<LogBrackhitResetsModel> {
    return this.repoService.brackhitRepo.logBrackhitResets(brackhitId, userId, trx);
  }

  async getUserFriendCompatibilityBrackhits(
    userId: string,
    friendId: string,
    query: GetFriendsCompatibilityQueryDto,
  ): Promise<PaginatedItems<UserFriendBrackhitDto>> {
    const brackhitsQB = this.repoService.brackhitRepo.getUserFriendCompatibilityBrackhitsQB(
      userId,
      friendId,
    );
    const totalQB = brackhitsQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, {
      skip: query.skipBrackhits,
      take: query.takeBrackhits,
    });

    brackhitsQB
      .select('b.brackhitId', 'b.name', 'b.thumbnail', 'sim.similarity')
      .orderBy('sim.similarity', 'desc')
      .orderBy('b.brackhitId', 'desc');

    const [brackhits, total] = await Promise.all([brackhitsQB, totalQB]);

    return {
      skip: query.skipBrackhits,
      take: query.takeBrackhits,
      total,
      items: brackhits,
    };
  }

  async getBrackhitsContainingArtist(
    artistId: number,
    userId: string,
    query: GetBrackhitsArtistQueryDto,
  ): Promise<GetBrackhitsArtistResponseDto> {
    const brackhitsQB = this.repoService.brackhitRepo.getTrackBrackhitsContainingArtist(artistId);
    const totalQB = brackhitsQB.clone();

    this.repoService.brackhitRepo.joinBrackhitUserToBuilder(brackhitsQB, userId);
    this.repoService.brackhitRepo.sortBrackhitsByCompletions(brackhitsQB);
    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, query);

    brackhitsQB
      .select('b.*', 'bt.type', 'bu.isComplete as isCompleted')
      .joinRelated(expr([Relations.Type, 'bt']));

    const [brackhits, total] = await Promise.all([brackhitsQB, totalQB.resultSize()]);

    return {
      artistId: artistId,
      skip: query.skip,
      take: query.take,
      total,
      brackhits: BrackhitsParser.parseBrackhitArtistDto(brackhits, userId, query.date),
    };
  }

  async getBrackhitsHotTakesPI(
    query: GetBrackhitHotTakesQueryDto,
  ): Promise<GetBrackhitHotTakesResponseDto> {
    const voteShareConst = await this.repoService.constantsRepo.getConstant(
      ConstantId.HOT_TAKE_PERCENTAGE_CUTOFF,
    );
    const userQB = this.repoService.brackhitRepo.getBrackhitHotTakeRandomUserId();
    let hotTakesQB = this.repoService.brackhitRepo.getBrackhitHotTakes(voteShareConst.value);
    const totalQB = hotTakesQB.clone();

    hotTakesQB.select(
      'b.brackhitId',
      'b.name',
      'br.roundId',
      'br.choiceId as firstChoiceId',
      'bm.choiceId as secondChoiceId',
      userQB.as('userId'),
    );

    hotTakesQB = BrackhitResultsModel.query()
      .select('ht.*', 'upi.username', 'upi.userImage')
      .from(hotTakesQB.as('ht'))
      .join(UserProfileInfoModel.getTableNameWithAlias(), 'upi.userId', `ht.userId`)
      .orderByRaw(
        'rand(ht.brackhit_id * ht.round_id * ht.first_choice_id * ht.second_choice_id + ?)',
        [query.seed],
      );

    QueryBuilderUtils.addPaginationToBuilder(hotTakesQB, query);

    const [hotTakes, total, settings] = await Promise.all([
      hotTakesQB.castTo<HotTakeMetaDto[]>(),
      totalQB.resultSize(),
      AppSettingsService.getAppSettingsState(),
    ]);

    await Promise.all(hotTakes.map((el) => this.joinContentToHotTakeChoices(el, settings)));

    return {
      seed: query.seed,
      skip: query.skip,
      take: query.take,
      total,
      items: BrackhitsParser.parseBrackhitHotTakes(hotTakes),
    };
  }

  async getBrackhitMeta(
    brackhitId: number,
    userId: string,
    date: Date,
    params: BrackhitMetaParams = { fetchOwner: true },
  ): Promise<BrackhitModel> {
    const metaQB = this.repoService.brackhitRepo
      .getBrackhitById(brackhitId)
      .select('b.*', 'bt.type', 'bu.isComplete as isCompleted')
      .joinRelated(expr([Relations.Type, 'bt']))
      .leftJoin(
        BrackhitUserModel.getTableNameWithAlias(),
        BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId),
      );
    const feedItemQB = this.repoService.feedRepo.findCentralFeedItem({
      sourceId: brackhitId,
      feedSource: FeedSources.Brackhit,
    });

    if (params.fetchOwner) {
      QueryBuilderUtils.fetchRelationsToBuilder(metaQB, [
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
    }

    const [meta, feedItem] = await Promise.all([metaQB, feedItemQB]);

    if (meta) {
      meta.centralId = feedItem?.id || null;
      meta.isLive = BrackhitsUtils.isLiveBrackhit(meta, date);
      meta.userStatus = BrackhitsUtils.identifyUserBrackhitStatus(meta);
    }

    return meta;
  }

  async getBrackhitCompletions(brackhitId: number): Promise<number> {
    return this.repoService.brackhitRepo.getUsersThatCompletedBrackhit(brackhitId).resultSize();
  }

  async getBrackhitChoices(
    brackhitId: number,
    params: BrackhitChoicesParams = { withVotes: false },
  ): Promise<BrackhitChoiceDto[]> {
    const choicesQB = this.repoService.brackhitRepo
      .getBrackhitMatchups(brackhitId)
      .select('bm.*', 'bc:ct.contentType as type', 'bc.contentId')
      .joinRelated(expr([Relations.BrackhitContent, 'bc', [Relations.ContentType, 'ct']]));

    if (params.withVotes) {
      const completions = await this.getBrackhitCompletions(brackhitId);
      if (completions >= BRACKHIT_CHOICES_MIN_COMPLETIONS) {
        choicesQB
          .select('br.votes')
          .leftJoin(BrackhitResultsModel.getTableNameWithAlias(), function () {
            this.on('bm.brackhitId', 'br.brackhitId')
              .andOn('bm.roundId', 'br.roundId')
              .andOn('bm.choiceId', 'br.choiceId');
          });
      }
    }

    const choices = await choicesQB.castTo<BrackhitChoiceDto[]>();
    await Promise.all(choices.map((choice) => this.joinContentToBrackhitChoice(choice)));
    return choices;
  }

  async joinContentToHotTakeChoices(
    hotTake: HotTakeMetaDto,
    settings: AppSettingsStateDto,
  ): Promise<void> {
    const [firstChoice, secondChoice] = await Promise.all([
      this.tracksService.getHotTakeChoiceContent(hotTake.firstChoiceId, { settings }),
      this.tracksService.getHotTakeChoiceContent(hotTake.secondChoiceId, { settings }),
    ]);

    hotTake.firstChoice = firstChoice;
    hotTake.secondChoice = secondChoice;
  }

  async joinContentToBrackhitChoice(choice: BrackhitChoiceWithContent): Promise<void> {
    choice.content = await this.brackhitsContentService.getContent(choice.contentId, choice.type);
  }

  async isBrackhitWithOneArtist(brackhitId: number): Promise<boolean> {
    const brackhit = await BrackhitTagModel.query().findById([brackhitId, 9]);
    return !!brackhit;
  }

  async getBrackhitsByHubAndTagPI(
    hubId: number,
    tagId: number,
    query: GetBrackhitsByHubAndTagQueryDto,
  ): Promise<PaginatedItems<BrackhitFtueDto>> {
    const brackhitsQB = this.repoService.brackhitRepo.getBrackhitsByHubAndTag(hubId, tagId);
    QueryBuilderUtils.excludeNotStartedBrackhits(brackhitsQB, query.date);
    QueryBuilderUtils.excludeHiddenBrackhits(brackhitsQB);
    const totalQB = brackhitsQB.clone();

    const constant = await this.repoService.constantsRepo.getConstant(
      ConstantId.FTUE_BRACKHITS_TRENDING_PERIOD,
    );
    this.repoService.brackhitRepo.sortBrackhitsByCompletionsInLastXDays(brackhitsQB, {
      date: query.date,
      days: constant.value,
      from: 'b',
      to: 'comp',
    });
    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, query);

    brackhitsQB.select('b.brackhitId', 'b.name', 'b.thumbnail');

    const [brackhits, total] = await Promise.all([
      brackhitsQB.castTo<BrackhitFtueDto[]>(),
      totalQB.resultSize(),
    ]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: brackhits,
    };
  }

  async updateBrackhit(
    userId: string,
    brackhitId: number,
    data: Partial<BrackhitModel>,
  ): Promise<BrackhitModel> {
    const [brackhit, brackhitWithName] = await Promise.all([
      this.repoService.brackhitRepo.getBrackhitById(brackhitId),
      this.repoService.brackhitRepo.getBrackhit({
        name: data.name || '',
      }),
    ]);

    if (!brackhit) {
      throw new NotFoundError(ErrorConst.BRACKHIT_NOT_FOUND);
    }

    if (brackhit.name !== data.name && brackhitWithName) {
      throw new BadRequestError(ErrorConst.BRACKHIT_NAME_IS_NOT_UNIQUE);
    }

    if (brackhit.ownerId !== userId) {
      throw new BadRequestError(ErrorConst.USER_IS_NOT_BRACKHIT_OWNER);
    }

    if (data.thumbnail && data.thumbnail.startsWith(S3_TEMP_IMAGE_PREFIX)) {
      const key = data.thumbnail.replace(S3_TEMP_IMAGE_PREFIX, '');
      await this.s3Service.copyFile(data.thumbnail, key);
      await this.s3Service.deleteObjects({ Objects: [{ Key: data.thumbnail }] });
      data.thumbnail = getS3ImagePrefix() + key;
    }

    return brackhit.$query().updateAndFetch(data);
  }

  async getBrackhitAnswers(data: Partial<BrackhitAnswerKeyModel>) {
    let answers = [];
    const brackhit = await this.repoService.brackhitRepo
      .getBrackhitById(data.brackhitId)
      .withGraphFetched(expr([Relations.Matchups]));

    if (!brackhit) {
      throw new Error(ErrorConst.BRACKHIT_NOT_FOUND);
    }

    answers = await this.repoService.userRepo.getBrackhitChoices(data.brackhitId, data.userId);

    // todo: revisit this
    // const answerKey = await this.repoService.brackhitRepo.getBrackhitAnswerKey(data);
    //
    // if (answerKey) {
    //   answers = await this.repoService.userRepo.getBrackhitChoices(
    //     data.brackhitId,
    //     answerKey.userId,
    //   );
    // }

    const { matchups, ...brackhitData } = brackhit;
    return { brackhit: brackhitData, matchups, answers };
  }

  async saveTrack(userId: string, body: SaveTrackBodyDto): Promise<UserSavedTracksModel> {
    await this.getBrackhitById(body.brackhitId);

    return this.repoService.brackhitRepo.saveTrack({ userId, ...body });
  }

  async getSavedTracks(
    userId: string,
    query: GetSavedTracksQueryDto,
  ): Promise<GetSavedTracksResponse> {
    const tracksQB = this.repoService.brackhitRepo.getSavedTracks(userId);
    const totalQB = tracksQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(tracksQB, query);
    QueryBuilderUtils.fetchRelationsToBuilder(tracksQB, [
      {
        relation: Relations.Brackhit,
        select: ['brackhitId', 'name', 'thumbnail'],
      },
    ]);

    tracksQB
      .select('ust.choiceId', 'bc.contentId')
      .joinRelated(expr([Relations.BrackhitContent, 'bc']))
      .orderBy('updatedAt', 'desc');

    const [tracks, total] = await Promise.all([tracksQB.castTo<SavedTrackDto[]>(), totalQB]);

    await Promise.all(
      tracks.map(async (track) => {
        // null values are replaced with empty array to prevent FE errors
        const { brackhit } = track;
        track.brackhit = brackhit === null ? [] : brackhit;
        // track.content = await this.brackhitsContentService.getTrack(track.contentId);
        // track.content = (await this.brackhitsContentService.getContent(
        //   track.contentId,
        //   BrackhitContentType.Track,
        // )) as TrackInfoDto;
      }),
    );

    return {
      userId,
      skip: query.skip,
      take: query.take,
      total,
      tracks,
    };
  }

  async getBrackhitResults(brackhitId: number): Promise<BrackhitResultDto[]> {
    const resultsQB = this.repoService.brackhitRepo
      .getBrackhitResults(brackhitId)
      .select(
        'bm.seed',
        'br.roundId',
        'br.choiceId',
        'bc.contentId',
        'bc:bct.contentType as type',
        'br.winner',
        'br.votes',
      );

    const results = await resultsQB.castTo<BrackhitResultDto[]>();
    await Promise.all(results.map((result) => this.joinContentToBrackhitChoice(result)));
    return results;
  }

  async uploadBrackhitImage(file: Express.Multer.File): Promise<UploadBrackhitImageResponse> {
    const key = `temp/brackhits/${v4()}/thumbnail`;
    const url = getS3ImagePrefix() + key;
    await this.s3Service.uploadFile(file.buffer, key, { ContentType: file.mimetype });
    return { url, key, thumbnail: key };
  }

  async getDailyStreakResponse(
    userId: string,
    query: GetDailyStreakQueryDto,
  ): Promise<GetDailyStreakResponseDto> {
    const dailyBrackhits = await this.repoService.brackhitRepo
      .getDailyBrackhitsUserHistory(userId, query.date)
      .select(
        'bd.brackhitId',
        'bd.date',
        'bu.isComplete',
        raw('DATE(bu.updated_at) as updatedAt'),
        raw('DATE(bu.initial_complete_time) as initialCompleteTime'),
      )
      .castTo<DailyBrackhitCompletion[]>();

    const completions = dailyBrackhits.map((b) => {
      return BrackhitsUtils.isDailyBrackhitCompleted(b) ? 1 : 0;
    });
    const streak = BrackhitsUtils.getDailyBrackhitsStreak(completions);

    return {
      userId,
      streak,
      skip: query.skip,
      take: query.take,
      total: completions.length,
      history: completions.slice(query.skip, query.skip + query.take),
    };
  }

  async saveBrackhit(userId: string, body: SaveBrackhitBodyDto): Promise<UserSavedBrackhitsModel> {
    return this.repoService.brackhitRepo.saveUserBrackhit({
      userId,
      ...body,
    });
  }

  async getSavedBrackhits(
    userId: string,
    query: GetSavedBrackhitsQueryDto,
  ): Promise<GetSavedBrackhitsResponseDto> {
    const brackhitsQB = this.repoService.brackhitRepo.getSavedBrackhits(userId);
    const totalQB = brackhitsQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, query);
    brackhitsQB
      .select('b.brackhitId', 'b.name', 'b.thumbnail')
      .joinRelated(expr([Relations.Brackhit, 'b']))
      .orderBy('usb.timestamp', 'desc');

    const [brackhits, total] = await Promise.all([
      brackhitsQB.castTo<SavedBrackhitDto[]>(),
      totalQB,
    ]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      brackhits,
    };
  }

  async checkIfChoiceInRightRound(
    brackhit: BrackhitModel,
    userId: string,
    param: PutBrackhitUserChoiceParamDto,
  ): Promise<BrackhitMatchupsModel | BrackhitUserChoicesModel> {
    if (BrackhitsUtils.isEarlyBrackhitRound(brackhit, param.roundId)) {
      const matchups = await this.repoService.brackhitRepo.getBrackhitMatchups(brackhit.brackhitId);
      return matchups.find((el) => el.roundId === param.roundId && el.choiceId === param.choiceId);
    } else {
      const choices = await this.repoService.userRepo.getBrackhitChoices(
        brackhit.brackhitId,
        userId,
      );
      const prevRounds = BrackhitsUtils.getPreviousRounds(param.roundId);
      return choices.find(
        (ch) => prevRounds.includes(ch.roundId) && ch.choiceId === param.choiceId,
      );
    }
  }

  async createBrackhitUserChoice(
    userId: string,
    param: PutBrackhitUserChoiceParamDto,
  ): Promise<BrackhitUserChoicesModel> {
    const brackhit = await this.getBrackhitById(param.brackhitId);

    const choice = await this.checkIfChoiceInRightRound(brackhit, userId, param);
    if (!choice) {
      throw new BadRequestError(ErrorConst.WRONG_CHOICE_FOR_ROUND);
    }

    const userBrackhit = await this.checkIfUserBrackhitIsNotCompleted(brackhit.brackhitId, userId);
    if (!userBrackhit) {
      await this.repoService.brackhitRepo.createUserBrackhit(brackhit.brackhitId, userId);
    }

    return this.repoService.brackhitRepo.insertOrUpdateUserChoice({
      userId,
      ...param,
    });
  }

  async submitBrackhit(userId: string, brackhitId: number): Promise<BrackhitUserModel> {
    const brackhit = await this.getBrackhitById(brackhitId);
    await this.checkIfUserBrackhitIsNotCompleted(brackhitId, userId);

    const userBrackhit = await this.repoService.brackhitRepo.completeBrackhit(brackhitId, userId);
    await TransactionsService.insertBrackhitCompletedAward(brackhitId, userId);

    const completedUsers = await this.repoService.userRepo.getUsersThatCompletedBrackhit(
      brackhitId,
    );

    this.eventsEmitter.emit(AppEventName.USER_COMPLETE_BRACKHIT, {
      userId,
      brackhitId,
      brackhitName: brackhit.name,
    });

    if (completedUsers.length > 1) {
      this.eventsEmitter.emit(AppEventName.CALCULATE_BRACKHIT_RESULTS, {
        userId,
        brackhitId,
      });
    }

    if (brackhit.ownerId !== ARTISTORY_NAME) {
      const completedWithoutOwner = completedUsers.filter((el) => el.userId !== brackhit.ownerId);
      if (NOTIFY_OWNER_BRACKHIT_COMPLETIONS.includes(completedWithoutOwner.length)) {
        this.eventsEmitter.emit(AppEventName.BRACKHIT_CREATOR_COMPLETIONS_NOTIFICATION, {
          brackhitId: brackhit.brackhitId,
          brackhitName: brackhit.name,
          userId: brackhit.ownerId,
          completionCount: completedWithoutOwner.length,
        });
      }
    }

    return userBrackhit;
  }

  // Returns final rounds user choices for brackhit compare screen
  async getUserFinalRoundsChoices(
    brackhit: BrackhitWithSize,
    userId: string,
    params: TrackInfoParams,
  ): Promise<FinalRoundChoiceDto[]> {
    const choicesQB = this.repoService.brackhitRepo.getUserQuarterFinalsChoices(brackhit, userId);
    const choicesLastRoundsQB = this.repoService.brackhitRepo.getUserChoicesMaxRounds(
      brackhit.brackhitId,
      userId,
    );

    return this.repoService.brackhitRepo
      .formatFinalRoundsChoices(choicesQB, choicesLastRoundsQB, params)
      .castTo<FinalRoundChoiceDto[]>();
  }

  // Returns final rounds winner choices for brackhit compare screen
  async getMasterFinalRoundsChoices(
    brackhit: BrackhitWithSize,
    params: TrackInfoParams,
  ): Promise<FinalRoundChoiceDto[]> {
    const choicesQB = this.repoService.brackhitRepo.getMasterQuarterFinalsChoices(brackhit);
    const choicesLastRoundsQB = this.repoService.brackhitRepo.getMasterChoicesMaxRounds(
      brackhit.brackhitId,
    );

    return this.repoService.brackhitRepo
      .formatFinalRoundsChoices(choicesQB, choicesLastRoundsQB, params)
      .castTo<FinalRoundChoiceDto[]>();
  }

  async getUserChoicesDifference(
    brackhit: BrackhitModel,
    tokenUserId: string,
    compareUserId: string,
    params: TrackInfoParams,
  ) {
    const tokenUserChoices = this.repoService.brackhitRepo.getUserChoicesMaxRounds(
      brackhit.brackhitId,
      tokenUserId,
    );
    const compareUserChoices = this.repoService.brackhitRepo.getUserChoicesMaxRounds(
      brackhit.brackhitId,
      compareUserId,
    );

    return this.repoService.brackhitRepo.formatBrackhitChoicesDifference(
      brackhit.brackhitId,
      tokenUserChoices,
      compareUserChoices,
      {
        ...params,
        userRoundName: 'tokenUserRoundId',
        compareRoundName: 'compareUserRoundId',
      },
    );
  }

  async getMasterChoicesDifference(
    brackhit: BrackhitWithSize,
    userId: string,
    params: TrackInfoParams,
  ): Promise<MasterChoiceDifferenceDto[]> {
    const masterChoices = this.repoService.brackhitRepo.getMasterChoicesMaxRounds(
      brackhit.brackhitId,
    );
    const userChoices = this.repoService.brackhitRepo.getUserChoicesMaxRounds(
      brackhit.brackhitId,
      userId,
    );

    return this.repoService.brackhitRepo
      .formatBrackhitChoicesDifference(brackhit.brackhitId, userChoices, masterChoices, {
        ...params,
        userRoundName: 'userRoundId',
        compareRoundName: 'masterRoundId',
      })
      .castTo<MasterChoiceDifferenceDto[]>();
  }

  async getMasterBrackhitSimilarity(brackhit: BrackhitWithSize, userId: string): Promise<number> {
    const userChoices = this.repoService.userRepo.getBrackhitChoices(brackhit.brackhitId, userId);
    const masterChoices = this.repoService.brackhitRepo.getResultsWinnerChoices(
      brackhit.brackhitId,
    );

    const result = await this.repoService.brackhitRepo.getSimilarityBetweenChoices(
      brackhit,
      userChoices,
      masterChoices,
    );

    return result.similarity;
  }

  async getUsersBrackhitSimilarity(
    brackhit: BrackhitWithSize,
    firstUserId: string,
    secondUserId: string,
  ): Promise<number> {
    const firstUserChoices = this.repoService.userRepo.getBrackhitChoices(
      brackhit.brackhitId,
      firstUserId,
    );
    const secondUserChoices = this.repoService.userRepo.getBrackhitChoices(
      brackhit.brackhitId,
      secondUserId,
    );

    const result = await this.repoService.brackhitRepo.getSimilarityBetweenChoices(
      brackhit,
      firstUserChoices,
      secondUserChoices,
    );

    return result.similarity;
  }

  async compareBrackhitToUser(
    brackhitId: number,
    tokenUserId: string,
    compareUserId: string,
  ): Promise<any> {
    const [brackhit, isOneArtist, tokenUserProfile, compareUserProfile] = await Promise.all([
      this.getBrackhitById(brackhitId),
      this.isBrackhitWithOneArtist(brackhitId),
      this.usersService.getUserProfileInfo(tokenUserId),
      this.usersService.getUserProfileInfo(compareUserId),
    ]);

    await Promise.all([
      this.checkIfUserBrackhitIsCompleted(brackhitId, tokenUserId),
      this.checkIfUserBrackhitIsCompleted(brackhitId, compareUserId),
    ]);

    const params: TrackInfoParams = {
      excludeArtists: isOneArtist,
      groupByRound: false,
    };

    const [similarity, tokenUserChoices, compareUserChoices, choicesDifference] = await Promise.all(
      [
        this.getUsersBrackhitSimilarity(brackhit, tokenUserId, compareUserId),
        this.getUserFinalRoundsChoices(brackhit, tokenUserId, params),
        this.getUserFinalRoundsChoices(brackhit, compareUserId, params),
        this.getUserChoicesDifference(brackhit, tokenUserId, compareUserId, params),
      ],
    );

    return {
      brackhitId,
      tokenUserId,
      tokenUserName: tokenUserProfile.username,
      tokenUserImage: tokenUserProfile.userImage,
      tokenInfluencerType: tokenUserProfile.influencerType,
      compareUserId,
      compareUserName: compareUserProfile.username,
      compareUserImage: compareUserProfile.userImage,
      compareInfluencerType: tokenUserProfile.influencerType,
      similarity,
      finalRoundsChoices: {
        tokenUserChoices,
        compareUserChoices,
      },
      choicesDifference,
    };
  }

  async compareBrackhitToMaster(
    brackhitId: number,
    userId: string,
  ): Promise<CompareMasterBrackhitResponseDto> {
    const [brackhit, isOneArtist, profile] = await Promise.all([
      this.getBrackhitById(brackhitId),
      this.isBrackhitWithOneArtist(brackhitId),
      this.usersService.getUserProfileInfo(userId),
    ]);

    if (brackhit.scoringState !== BrackhitScoringState.CALCULATED) {
      throw new BadRequestError(ErrorConst.BRACKHIT_RESULTS_ARE_NOT_READY);
    }

    await this.checkIfUserBrackhitIsCompleted(brackhitId, userId);

    const params: TrackInfoParams = {
      excludeArtists: isOneArtist,
      groupByRound: false,
    };

    const [similarity, userChoices, masterChoices, choicesDiff] = await Promise.all([
      this.getMasterBrackhitSimilarity(brackhit, userId),
      this.getUserFinalRoundsChoices(brackhit, userId, params),
      this.getMasterFinalRoundsChoices(brackhit, params),
      this.getMasterChoicesDifference(brackhit, userId, params),
    ]);

    return {
      brackhitId,
      tokenUserProfile: {
        userId,
        username: profile.username,
        userImage: profile.userImage,
        influencerType: profile.influencerType,
      },
      similarity,
      finalRoundsChoices: {
        userChoices,
        masterChoices,
      },
      choicesDifference: choicesDiff,
    };
  }

  async getBrackhitUsers(data: Partial<BrackhitUserModel>) {
    return this.repoService.brackhitRepo.getBrackhitUsers(data);
  }

  async createBrackhitAnswers(
    data: Partial<BrackhitAnswerKeyModel>,
  ): Promise<BrackhitAnswerKeyModel> {
    return this.repoService.brackhitRepo.createBrackhitAnswerKey(data);
  }

  async getBrackhitAds(): Promise<GetBrackhitAdsResponseDto> {
    const brackhits = await this.repoService.brackhitRepo
      .getBrackhitAds()
      .select('b.brackhitId', 'b.name', 'b.thumbnail')
      .orderBy('ba.position', 'desc')
      .castTo<BrackhitAdDto[]>();

    return {
      brackhits,
    };
  }

  async getSuggestedBrackhitsForUser(
    params: SuggestUserBrackhitsParams,
  ): Promise<SuggestedBrackhitDto[]> {
    const [lastBrackhit, forYouQuery, countConst] = await Promise.all([
      this.repoService.userRepo.getUserLastCompletedBrackhit(params.userId),
      this.brackhitsHomeService.getForYouBrackhitsSqlQuery(params.userId),
      this.repoService.constantsRepo.getConstant(ConstantId.SUGGESTED_BRACKHITS_COUNT),
    ]);

    // currently not in use
    // const tags = await this.getBrackhitTags(lastBrackhit.brackhitId);
    // if (tags.includes(BrackhitTags.Madness)) {
    //   return this.getSuggestedBrackhitsByTag(BrackhitTags.Madness, params.userId, params.date);
    // }

    const forYouBrackhitsQB = this.repoService.brackhitHomeRepo.getForYouBrackhits(
      forYouQuery,
      params.userId,
      {
        onlyNoneStatus: true,
      },
    );
    this.repoService.brackhitHomeRepo.leftJoinBrackhitUserToBrackhits(
      forYouBrackhitsQB,
      params.userId,
      'bu',
    );
    QueryBuilderUtils.addPaginationToBuilder(forYouBrackhitsQB, {
      skip: 0,
      take: countConst.value,
    });

    const forYouBrackhits = await BrackhitsUtils.getBrackhitMeta(forYouBrackhitsQB);

    // return default suggested brackhits based on last user completed brackhit
    // if user does not have ForYou brackhits
    if (forYouBrackhits.length === 0) {
      return this.getDefaultSuggestedBrackhits(lastBrackhit.brackhitId, params.userId, params.date);
    }

    return BrackhitsParser.parseSuggestedBrackhits(forYouBrackhits, params.date);
  }

  async getBrackhitTags(brackhitId: number): Promise<number[]> {
    const tags = await this.repoService.brackhitRepo.getBrackhitTags(brackhitId);
    return tags.map((el) => el.tagId);
  }

  async getBrackhitGenres(brackhitId: number): Promise<number[]> {
    const genres = await this.repoService.brackhitRepo.getBrackhitGenres(brackhitId);
    return genres.map((el) => el.genreId);
  }

  // returns default suggested brackhits for a brackhit
  async getDefaultSuggestedBrackhits(brackhitId: number, userId: string, date: Date) {
    const brackhitsQB = this.repoService.brackhitRepo.getDefaultSuggestedBrackhits(brackhitId);
    this.repoService.brackhitHomeRepo.leftJoinBrackhitUserToBrackhits(brackhitsQB, userId, 'bu');
    brackhitsQB.whereNull('bu.isComplete').where('b.timeLive', '<=', date).orderBy('bds.position');

    const brackhits = await BrackhitsUtils.getBrackhitMeta(brackhitsQB);

    return BrackhitsParser.parseSuggestedBrackhits(brackhits, date);
  }

  // returns suggested brackhits for a brackhit
  async getSuggestedBrackhits(
    userId: string,
    params: SuggestBrackhitsParams,
  ): Promise<SuggestedBrackhitDto[]> {
    const brackhitsQB = this.repoService.brackhitRepo.getBrackhitsWithSameGenre(params.brackhitId);

    this.repoService.brackhitHomeRepo.leftJoinBrackhitUserToBrackhits(brackhitsQB, userId, 'bu');
    this.repoService.brackhitRepo.sortBrackhitsByCompletionsInLastXDays(brackhitsQB, {
      date: params.date,
      days: 30,
      from: 'b',
      to: 'comp',
    });
    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, { skip: 0, take: 5 });
    brackhitsQB.whereNull('bu.isComplete');

    const brackhits = await BrackhitsUtils.getBrackhitMeta(brackhitsQB);

    if (brackhits.length === 5) {
      return this.getDefaultSuggestedBrackhits(params.brackhitId, userId, params.date);
    }

    return BrackhitsParser.parseSuggestedBrackhits(brackhits, params.date);
  }

  // returns tag brackhits sorted by completions in last X days
  async getMostPopularTagBrackhits(tagId: number, userId: string, query: GetTagBrackhitsQueryDto) {
    const [tag, constant] = await Promise.all([
      BrackhitTagTypeModel.query().findById(tagId),
      this.repoService.constantsRepo.getConstant(
        ConstantId.POPULAR_TAG_BRACKHITS_COMPLETIONS_PERIOD,
      ),
    ]);

    const [brackhitsQB, notCompletedBrackhits] = [
      this.repoService.brackhitRepo.getTagBrackhits(tagId),
      this.repoService.brackhitRepo.getUserNotCompletedBrackhits(userId),
    ];

    brackhitsQB.join(notCompletedBrackhits.as('ncb'), 'ncb.brackhitId', 'b.brackhitId');

    const totalQB = brackhitsQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, query);
    this.repoService.brackhitRepo.sortBrackhitsByCompletionsInLastXDays(brackhitsQB, {
      date: query.date,
      days: constant.value * 7, // constant value is in weeks,
      from: 'b',
      to: 'comp',
    });
    brackhitsQB.select('b.brackhitId', 'b.name', 'b.thumbnail');

    const [brackhits, total] = await Promise.all([brackhitsQB, totalQB]);

    return {
      ...tag,
      skip: query.skip,
      take: query.take,
      total: total,
      brackhits,
    };
  }

  async searchBrackhits(userId: string, query: SearchBrackhitsQueryDto) {
    const brackhitsQB = this.repoService.brackhitRepo.searchBrackhits(query.query, query.date);
    const totalQB = brackhitsQB.clone().resultSize();

    this.repoService.brackhitRepo.joinBrackhitMetaToBuilder(brackhitsQB, userId, {
      fetchOwner: false,
    });
    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, query);
    brackhitsQB.orderBy('b.brackhitId', 'desc');

    const [brackhits, total] = await Promise.all([brackhitsQB, totalQB]);

    return {
      query: query.query,
      skip: query.skip,
      take: query.take,
      totalResults: total,
      results: BrackhitsParser.parseSearchedBrackhits(brackhits, query.date),
    };
  }

  async getBrackhitsFtue() {
    const brackhitsFtue = await this.repoService.brackhitRepo
      .getBrackhitsFtue()
      .select('b.brackhitId', 'b.name', 'b.thumbnail', 'bf.hubId', 'g.genreName');

    const genresMap = new Map(brackhitsFtue.map((el) => [el.hubId, el]));

    return Array.from(genresMap.entries()).map(([hubId, brackhit]) => ({
      hubId,
      name: brackhit.genreName,
      brackhits: brackhitsFtue.filter((b) => b.hubId === hubId),
    }));
  }

  async getUserFriendsThatCompletedBrackhit(
    brackhitId: number,
    userId: string,
    query: GetBrackhitFriendsQueryDto,
  ): Promise<GetBrackhitFriendsResponseDto> {
    const [friendsQB, similarityQB] = [
      this.repoService.brackhitRepo.getUserFriendsThatCompletedBrackhit(brackhitId, userId),
      this.repoService.brackhitRepo.getUsersBrackhitSimilarity(brackhitId, userId),
    ];
    const totalQB = friendsQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(friendsQB, query);
    friendsQB
      .select(
        'upi.userId',
        'upi.username',
        'upi.userImage',
        'ui.typeId as influencerType',
        'sim.similarity',
      )
      .leftJoinRelated(expr([Relations.UserInfluencer, 'ui']))
      .leftJoin(similarityQB.as('sim'), 'sim.userId', 'upi.userId')
      .orderBy('upi.username');

    const [brackhit, friends, total] = await Promise.all([
      this.repoService.brackhitRepo.getBrackhitById(brackhitId),
      friendsQB,
      totalQB,
    ]);

    return {
      brackhitId: brackhit.brackhitId,
      name: brackhit.name,
      skip: query.skip,
      take: query.take,
      total,
      friends,
    };
  }

  async isUserLikedBrackhit(userId: string, brackhitId: number) {
    const userLike = await LogContentModel.query()
      .joinRelated(expr([Relations.CentralFeed]))
      .findOne({
        [`${Relations.CentralFeed}.feedSource`]: FeedSources.Brackhit,
        [`${Relations.CentralFeed}.sourceId`]: brackhitId,
        interactionId: InteractionTypes.Like,
        userId: userId,
      });
    console.log(userLike);
    return !!userLike;
  }

  async getBrackhitTotalLikes(brackhitId: number) {
    return LogContentModel.query()
      .joinRelated(expr([Relations.CentralFeed]))
      .where({
        [`${Relations.CentralFeed}.feedSource`]: FeedSources.Brackhit,
        [`${Relations.CentralFeed}.sourceId`]: brackhitId,
        interactionId: InteractionTypes.Like,
      })
      .groupBy('userId')
      .resultSize();
  }

  async createBrackhit(userId: string, body: CreateBrackhitInput, appType?: RequestAppType) {
    const contentTypeId = BrackhitContentTypeId[body.type];
    const startingRound = BrackhitsUtils.getStartingRound(body.size);
    const seeds = BrackhitsUtils.seeding(body.size);

    const elements = await Promise.all(
      body.content.map(async (el) => {
        let element;

        if (body.type === BrackhitContentType.Custom) {
          const choice = el as BrackhitCustomContentInput;
          element = await this.brackhitsContentService.getCustomContent({
            name: choice.name,
            thumbnail: choice.thumbnail,
            contentUrl: choice.contentUrl,
          });
          if (!element) {
            element = await this.brackhitsContentService.saveCustomContent(choice);
          }
        } else {
          const choice = el as BrackhitContentInput;
          element = await this.brackhitsContentService.getContent(choice.id, body.type);
          if (
            !element ||
            body.type === BrackhitContentType.Youtube ||
            (body.type === BrackhitContentType.Track && !(element as TrackInfoDto)?.preview)
          ) {
            element = await this.brackhitsContentService.saveContent(
              choice.id,
              body.type,
              choice.data,
            );
          }
        }

        return element;
      }),
    );

    if (body.thumbnail.startsWith('temp/')) {
      const thumbnail = body.thumbnail.replace('temp/', '');
      await this.s3Service.copyFile(body.thumbnail, thumbnail);
      await this.s3Service.deleteObjects({ Objects: [{ Key: body.thumbnail }] });
      body.thumbnail = getS3ImagePrefix() + thumbnail;
    }

    const brackhit = await this.repoService.brackhitRepo.createBrackhit({
      typeId: contentTypeId,
      name: body.name,
      ownerId: userId,
      description: body.description,
      duration: body.duration,
      timeLive: body.timeLive,
      thumbnail: body.thumbnail,
      size: body.size,
      scoringState: BrackhitScoringState.IN_PROGRESS,
      startingRound: startingRound,
      sortingId: BRACKHIT_SORTING_ID[body.sort],
      hidden: Number(appType === RequestAppType.WEB),
    });

    await Promise.all([
      brackhit.$query().patch({ url: BrackhitsUtils.getBrackhitUrl(brackhit.brackhitId) }),
      this.repoService.feedRepo.createCentralFeedItem({
        feedSource: FeedSources.Brackhit,
        sourceId: brackhit.brackhitId,
      }),
    ]);

    await Promise.all(
      elements.map(async (el, i) => {
        const seed = body.size === BrackhitSize._16 ? BrackhitsUtils.getSeedForIndex(i) : seeds[i];
        const roundId = startingRound + Math.floor(i / 2);
        const content = elements[seed - 1];

        const choice = await this.repoService.brackhitRepo.findOrCreateBrackhitChoice({
          contentTypeId,
          contentId: content.id,
        });

        await this.repoService.brackhitRepo.createMatchup({
          brackhitId: brackhit.brackhitId,
          choiceId: choice.choiceId,
          roundId: roundId,
          seed: seed,
        });
      }),
    );

    if (appType !== RequestAppType.WEB) {
      this.eventsEmitter.emit(AppEventName.CREATE_BRACKHIT, {
        userId,
        brackhitId: brackhit.brackhitId,
        brackhitName: brackhit.name,
      });
    }

    return brackhit;
  }
}
