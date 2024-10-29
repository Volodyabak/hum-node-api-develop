import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BrackhitAnswerKeyModel } from '../../../../../database/Models/Brackhit/BrackhitAnswerKeyModel';
import { BrackhitUserChoicesModel } from '../../../../../database/Models/BrackhitUserChoicesModel';
import { BrackhitModel } from '../../../../../database/Models/BrackhitModel';
import { Relations } from '../../../../../database/relations/relations';
import { BrackhitUserModel } from '../../../../../database/Models/BrackhitUserModel';
import { Model, PartialModelObject, QueryBuilder, raw, Transaction } from 'objection';
import { BrackhitUserScoreModel } from '../../../../../database/Models/BrackhitUserScoreModel';
import {
  BrackhitArtistsAppearancesModel,
  BrackhitDailyModel,
  BrackhitTagModel,
  LogBrackhitResetsModel,
  LogShareModel,
  UserProfileInfoModel,
  UserSavedBrackhitsModel,
  UserSavedTracksModel, YoutubeVideoModel,
} from '../../../../../database/Models';
import { BRACKHIT_SUBMISSION_PERIOD } from '../../../brackhits/constants/brackhits-hub.constants';
import { DateUtils } from '../../../../Tools/utils/date-utils';
import { expr } from '../../../../../database/relations/relation-builder';
import { JoinOperation, JoinParams, PaginationParams } from '../../../../Tools/dto/util-classes';
import { BrackhitResultsModel } from '../../../../../database/Models/BrackhitResultsModel';
import { BrackhitMatchupsModel } from '../../../../../database/Models/BrackhitMatchupsModel';
import { QueryBuilderUtils } from '../../../../Tools/utils/query-builder.utils';
import { BrackhitsUtils } from '../../../brackhits/utils/brackhits.utils';
import {
  BrackhitChoicesDiffParams,
  BrackhitMetaParams,
  BrackhitTotalSharesParams,
  BrackhitWithSize,
  SortBrackhitsByCompletionsInLastDaysParams,
  TrackInfoParams,
} from '../../../brackhits/interfaces/brackhits.interface';
import { TrackRepository } from '../track/track.repository';
import { ConstantId } from '../../../constants/constants';
import { ConstantsRepository } from '../../../constants/repository/constants.repository';
import { GetBrackhitUsersResponseDto } from '../../../brackhits/api-dto/brackhits-api.dto';
import { BrackhitDefaultSuggestionsModel } from '../../../../../database/Models/Brackhit/BrackhitDefaultSuggestionsModel';
import { BrackhitGenreModel } from '../../../../../database/Models/BrackhitGenreModel';
import { BrackhitFtueModel } from '../../../../../database/Models/Brackhit/BrackhitFtueModel';
import { UserRepository } from '../user/user.repository';
import { BrackhitCustomContentNameModel } from '../../../../../database/Models/Brackhit/brackhit-custom-content-name.model';
import { BrackhitContentModel } from '@database/Models/Brackhit/BrackhitContentModel';
import { YoutubeChannelModel } from '../../../../../database/Models/Artist/YoutubeChannelModel';

@Injectable()
export class BrackhitRepository {
  constructor(
    private readonly trackRepo: TrackRepository,
    private readonly constantsRepo: ConstantsRepository,
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository: UserRepository,
  ) {}

  getBrackhitById(brackhitId: number) {
    return BrackhitModel.query().alias('b').findById(brackhitId);
  }

  getBrackhit(data: PartialModelObject<BrackhitModel>) {
    return BrackhitModel.query().alias('b').findOne(data);
  }

  getBrackhitAnswerKey(data: Partial<BrackhitAnswerKeyModel>) {
    return BrackhitAnswerKeyModel.query().findOne(data);
  }

  deleteUserBrackhitChoices(brackhitId: number, userId: string, trx?: Transaction) {
    return BrackhitUserChoicesModel.query(trx).where({ brackhitId, userId }).del();
  }

  resetUserBrackhit(brackhitId: number, userId: string, completeTime: Date, trx?: Transaction) {
    return BrackhitUserModel.query(trx).updateAndFetchById([userId, brackhitId], {
      isComplete: 0,
      initialCompleteTime: completeTime,
    });
  }

  deleteUserBrackhitScore(brackhitId: number, userId: string, trx?: Transaction) {
    return BrackhitUserScoreModel.query(trx).deleteById([brackhitId, userId]);
  }

  logBrackhitResets(brackhitId: number, userId: string, trx?: Transaction) {
    return LogBrackhitResetsModel.query(trx).insertAndFetch({ brackhitId, userId });
  }

  getUserFriendCompatibilityBrackhitsQB(userId: string, friendId: string) {
    return BrackhitModel.query()
      .alias('b')
      .join(
        this.getUserBrackhitsWithSimilarity(userId, friendId).as('sim'),
        'b.brackhitId',
        'sim.brackhitId',
      )
      .join(
        BrackhitUserModel.getTableNameWithAlias('bu1'),
        BrackhitUserModel.callbacks.joinUserCompletedBrackhit(userId, { to: 'bu1' }),
      )
      .join(
        BrackhitUserModel.getTableNameWithAlias('bu2'),
        BrackhitUserModel.callbacks.joinUserCompletedBrackhit(friendId, { to: 'bu2' }),
      );
  }

  getUserBrackhitsWithSimilarity(firstUserId: string, secondUserId: string) {
    const firstUserChoices = BrackhitUserChoicesModel.query()
      .alias('buc')
      .where('buc.userId', firstUserId);
    const secondUserChoices = BrackhitUserChoicesModel.query().where('userId', secondUserId);

    return BrackhitModel.query()
      .select(
        'sub.brackhitId',
        raw(BrackhitUserChoicesModel.rawSql.calculateSimilarity('similarity', 'sub')),
      )
      .from(
        firstUserChoices
          .select(
            'buc.brackhitId',
            raw(
              BrackhitUserChoicesModel.rawSql.selectChoiceSimilarityPoints({
                from: 'buc',
                to: 'comp',
              }),
            ),
          )
          .join(
            secondUserChoices.as('comp'),
            BrackhitUserChoicesModel.callbacks.joinOnBrackhitIdAndRoundIdAndChoiceId({
              from: 'buc',
              to: 'comp',
            }),
          )
          .as('sub'),
      )
      .groupBy('sub.brackhitId');
  }

  getUserNotCompletedBrackhits(userId: string) {
    return BrackhitModel.query()
      .alias('b')
      .leftJoin(
        BrackhitUserModel.getTableNameWithAlias('bu'),
        BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId),
      )
      .whereNull('bu.initialCompleteTime')
      .where(function () {
        this.where('bu.isComplete', 0).orWhereNull('bu.isComplete');
      });
  }

  getAlbumBrackhits(userId: string, userTime: Date) {
    return BrackhitModel.query()
      .alias('b')
      .joinRelated('[content as bc.[trackAlbums as sa]]')
      .whereIn('b.typeId', [1, 3])
      .andWhere('b.timeLive', '<=', userTime)
      .groupBy('b.brackhitId', 'bc:sa.albumKey')
      .havingRaw('COUNT(DISTINCT bc.content_id) = ?', [16]);
  }

  getTagBrackhits(tagId: number) {
    return BrackhitModel.query()
      .alias('b')
      .joinRelated(expr([Relations.BrackhitTags, 'bt']))
      .where(`bt.tagId`, tagId);
  }

  getBrackhitsByMasterGenre(genreId: number) {
    return BrackhitModel.query()
      .alias('b')
      .joinRelated(expr([Relations.BrackhitGenres, 'bg']))
      .where('bg.genreId', genreId);
  }

  getArtistoryBrackhits() {
    return BrackhitModel.query().alias('b').whereNot('b.ownerId', 'artistory');
  }

  // not in use, ignore usage in brackhit-hub repo
  getBrackhitsSortedByCompletionsInLastXDays(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    userTime: Date,
    params: PaginationParams,
    days: number = BRACKHIT_SUBMISSION_PERIOD,
  ) {
    const minCompletionDate = DateUtils.subtractDaysFromDate(userTime, days);

    return BrackhitModel.query()
      .alias('b')
      .join(brackhitsQB.as('sub'), 'b.brackhitId', 'sub.brackhitId')
      .leftJoinRelated('brackhitUser as bu1')
      .where('bu1.updatedAt', '>=', minCompletionDate)
      .groupBy('b.brackhitId')
      .orderByRaw(BrackhitUserModel.rawSql.orderByIsCompleteSumDesc('bu1'))
      .offset(params.skip || 0)
      .limit(params.take || Number.MAX_SAFE_INTEGER);
  }

  getTrackBrackhitsContainingArtist(artistId: number) {
    const constantQB = this.constantsRepo.getConstant(
      ConstantId.ARTIST_PROFILE_BRACKHIT_APPEARANCES,
    );

    return BrackhitModel.query()
      .alias('b')
      .join(BrackhitArtistsAppearancesModel.getTableNameWithAlias('baa'), function () {
        this.on('baa.brackhitId', 'b.brackhitId').andOnVal('baa.artistId', artistId);
      })
      .where((builder) => builder.where('b.typeId', 1).orWhere('b.typeId', 3))
      .where('baa.artistId', artistId)
      .where('baa.appearances', '>=', constantQB.select('value'));
  }

  getArtistBrackhitsContainingArtist(artistId: number) {
    return BrackhitModel.query()
      .alias('b')
      .select('b.brackhitId')
      .leftJoinRelated(expr([Relations.Content, 'bc']))
      .where('b.typeId', 2)
      .where('bc.contentId', artistId)
      .groupBy('b.brackhitId');
  }

  // returns QB containing number of completions for all brackhits
  getBrackhitsCompletions(columnName: string) {
    return BrackhitModel.query()
      .alias('b')
      .select('b.brackhitId', raw(BrackhitUserModel.rawSql.coalesceSumIsComplete('bu', columnName)))
      .leftJoinRelated(expr([Relations.BrackhitUser, 'bu']))
      .groupBy('b.brackhitId');
  }

  // returns QB containing number of completions in last X days for all brackhits
  getBrackhitsCompletionsInLastXDays(date: Date, days: number) {
    const minCompletionDate = DateUtils.subtractDaysFromDate(date, days);

    const completions = BrackhitUserModel.query().where('updatedAt', '>=', minCompletionDate);

    return BrackhitModel.query()
      .alias('b')
      .select(
        'b.brackhitId',
        raw(BrackhitUserModel.rawSql.coalesceSumIsComplete('bu', 'completions')),
      )
      .leftJoin(completions.as('bu'), 'bu.brackhitId', 'b.brackhitId')
      .groupBy('b.brackhitId');
  }

  // joins brackhits completions to builder and orders results
  sortBrackhitsByCompletions(brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>): void {
    const completionsQB = this.getBrackhitsCompletions('completions');

    brackhitsQB
      .join(completionsQB.as('comp'), 'comp.brackhitId', 'b.brackhitId')
      .orderBy('comp.completions', 'desc')
      .orderBy('b.brackhitId', 'desc');
  }

  sortBrackhitsByCompletionsInLastXDays<T extends Model>(
    brackhits: QueryBuilder<T, T[]>,
    params: SortBrackhitsByCompletionsInLastDaysParams,
  ): void {
    const completionsQB = this.getBrackhitsCompletionsInLastXDays(params.date, params.days);

    brackhits
      .join(completionsQB.as(params.to), `${params.to}.brackhitId`, `${params.from}.brackhitId`)
      .orderBy(`${params.to}.completions`, 'desc')
      .orderBy(`${params.from}.brackhitId`, 'desc');
  }

  // Default param values: { from: 'b', to: 'bu', joinOperation: JoinOperation.leftJoin }
  joinBrackhitUserToBuilder<T extends Model>(
    builder: QueryBuilder<T, T[]>,
    userId: string,
    params: JoinParams = {},
  ): void {
    QueryBuilderUtils.setDefaultJoinParams(params, 'b', 'bu', JoinOperation.leftJoin);
    QueryBuilderUtils.performJoinOperationOnBuilder(
      builder,
      BrackhitUserModel.getTableNameWithAlias(params.to),
      BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId, params),
      params.join,
    );
  }

  getBrackhitHotTakes(cutoffPercentage: number) {
    const completionConst = this.constantsRepo.getConstant(ConstantId.HOT_TAKE_MIN_COMPLETION);
    const completionsQB = this.getBrackhitsCompletions('completions');

    return BrackhitResultsModel.query()
      .alias('br')
      .joinRelated(expr([Relations.Brackhit, 'b']))
      .join(completionsQB.as('comp'), 'b.brackhitId', 'comp.brackhitId')
      .join(BrackhitMatchupsModel.getTableNameWithAlias(), function () {
        this.on('br.brackhitId', 'bm.brackhitId')
          .andOn('br.roundId', 'bm.roundId')
          .andOn('br.choiceId', '!=', 'bm.choiceId');
      })
      .whereRaw('br.votes / comp.completions <= ?', [cutoffPercentage / 100])
      .where('comp.completions', '>', completionConst.select('value'));
  }

  // returns userId of one random user who has chosen the same hot take choice.
  // Returned QB is intended to be used as a subquery inside select() method
  getBrackhitHotTakeRandomUserId(from: string = 'br') {
    return BrackhitUserChoicesModel.query()
      .alias('buc')
      .select('buc.userId')
      .join(BrackhitUserModel.getTableNameWithAlias(), function () {
        this.on('bu.brackhitId', 'buc.brackhitId').andOn('bu.userId', 'buc.userId');
      })
      .whereColumn('buc.brackhitId', `${from}.brackhitId`)
      .whereColumn('buc.roundId', `${from}.roundId`)
      .whereColumn('buc.choiceId', `${from}.choiceId`)
      .where('bu.isComplete', 1)
      .orderByRaw('rand()')
      .limit(1);
  }

  getCompletedUserBrackhits() {
    return BrackhitUserModel.query().alias('bu').where('bu.isComplete', 1);
  }

  getInProgressUserBrackhits() {
    return BrackhitUserModel.query().alias('bu').where('bu.isComplete', 0);
  }

  getUsersThatCompletedBrackhit(brackhitId: number) {
    return this.getCompletedUserBrackhits().where('bu.brackhitId', brackhitId);
  }

  getBrackhitMatchups(brackhitId: number) {
    return BrackhitMatchupsModel.query().alias('bm').where('bm.brackhitId', brackhitId);
  }

  getBrackhitsByHubAndTag(genreId: number, tagId: number) {
    return BrackhitModel.query()
      .alias('b')
      .joinRelated(expr([Relations.BrackhitGenres, 'bg'], [Relations.BrackhitTags, 'bt']))
      .where('bt.tagId', tagId)
      .where('bg.genreId', genreId)
      .groupBy('b.brackhitId');
  }

  saveTrack(data: PartialModelObject<UserSavedTracksModel>) {
    return UserSavedTracksModel.query()
      .insertAndFetch(data)
      .onConflict()
      .merge(['savedFlag', 'updatedAt']);
  }

  getSavedTracks(userId: string) {
    return UserSavedTracksModel.query().alias('ust').where({ userId, savedFlag: 1 });
  }

  getBrackhitResults(brackhitId: number) {
    return BrackhitResultsModel.query()
      .alias('br')
      .joinRelated(expr([Relations.Choice, 'bc', [Relations.ContentType, 'bct']]))
      .join(
        BrackhitMatchupsModel.getTableNameWithAlias('bm'),
        BrackhitMatchupsModel.callbacks.joinOnChoiceIdAndBrackhitIdVal(brackhitId, {
          from: 'br',
          to: 'bm',
        }),
      )
      .where('br.brackhitId', brackhitId);
  }

  removeDailyBrackhitsFromBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
  ): void {
    brackhitsQB.leftJoinRelated(expr([Relations.DailyBrackhit, 'db'])).whereNull('db.id');
  }

  getDailyBrackhitsUserHistory(userId: string, date: Date) {
    return BrackhitDailyModel.query()
      .alias('bd')
      .leftJoin(
        BrackhitUserModel.getTableNameWithAlias('bu'),
        BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId, {
          from: 'bd',
          to: 'bu',
        }),
      )
      .where('bd.date', '<=', date)
      .orderBy('bd.date', 'desc');
  }

  saveUserBrackhit(data: PartialModelObject<UserSavedBrackhitsModel>) {
    return UserSavedBrackhitsModel.query().insertAndFetch(data).onConflict().ignore();
  }

  getSavedBrackhits(userId: string) {
    return UserSavedBrackhitsModel.query().alias('usb').where('usb.userId', userId);
  }

  createUserBrackhit(brackhitId: number, userId: string) {
    return BrackhitUserModel.query()
      .insertAndFetch({
        userId,
        brackhitId,
        isComplete: 0,
      })
      .onConflict()
      .ignore();
  }

  insertOrUpdateUserChoice(data: PartialModelObject<BrackhitUserChoicesModel>) {
    return BrackhitUserChoicesModel.query().insertAndFetch(data).onConflict().merge(['choiceId']);
  }

  completeBrackhit(brackhitId: number, userId: string) {
    return BrackhitUserModel.query()
      .insertAndFetch({
        brackhitId,
        userId,
        isComplete: 1,
      })
      .onConflict()
      .merge(['isComplete']);
  }

  deleteUserCreatedBrackhits(userId: string, trx?: Transaction) {
    return BrackhitModel.query(trx).delete().where({ ownerId: userId });
  }

  // Returns user brackhit choices from rounds 9-12
  getUserQuarterFinalsChoices(brackhit: BrackhitWithSize, userId: string) {
    return BrackhitUserChoicesModel.query()
      .alias(`buc`)
      .where(`buc.brackhitId`, brackhit.brackhitId)
      .where(`buc.userId`, userId)
      .whereIn(`buc.roundId`, BrackhitsUtils.getQuarterFinalsRounds(brackhit));
  }

  // Returns brackhit choices from rounds 9-12
  getMasterQuarterFinalsChoices(brackhit: BrackhitWithSize) {
    return BrackhitResultsModel.query()
      .alias(`br`)
      .where(`br.brackhitId`, brackhit.brackhitId)
      .whereIn(`br.roundId`, BrackhitsUtils.getQuarterFinalsRounds(brackhit))
      .where(`br.winner`, 1);
  }

  // Returns last round in which brackhit choice appeared
  getUserChoicesMaxRounds(brackhitId: number, userId: string) {
    return BrackhitUserChoicesModel.query()
      .alias('buc')
      .select(`buc.choiceId`)
      .max(`buc.roundId as roundId`)
      .where(`buc.brackhitId`, brackhitId)
      .where(`buc.userId`, userId)
      .groupBy(`buc.choiceId`);
  }

  // Returns last round in which brackhit choice appeared
  getMasterChoicesMaxRounds(brackhitId: number) {
    return BrackhitResultsModel.query()
      .alias(`br`)
      .select(`br.choiceId`)
      .max(`br.roundId as roundId`)
      .where(`br.brackhitId`, brackhitId)
      .groupBy(`br.choiceId`)
      .where(`br.winner`, 1);
  }

  formatFinalRoundsChoices<T extends Model>(
    finalChoices: QueryBuilder<T, T[]>,
    choicesLastRounds: QueryBuilder<T, T[]>,
    params: TrackInfoParams,
  ) {
    const choices = BrackhitUserChoicesModel.query()
      .alias('ch')
      .from(finalChoices.as('ch'))
      .select('ch.choiceId', 'sub.roundId')
      .join(choicesLastRounds.as('sub'), 'ch.choiceId', 'sub.choiceId');

    const meta = this.trackRepo.addTrackInfoToChoices(choices, params);

    return meta.orderBy('sub.roundId', 'desc');
  }

  formatBrackhitChoicesDifference<T extends Model>(
    brackhitId: number,
    userChoices: QueryBuilder<BrackhitUserChoicesModel, BrackhitUserChoicesModel[]>,
    compareChoices: QueryBuilder<T, T[]>,
    params: BrackhitChoicesDiffParams,
  ) {
    const matchupChoices = BrackhitMatchupsModel.query()
      .alias('bm')
      .select(
        'bm.choiceId',
        raw(BrackhitMatchupsModel.rawSql.selectNextRound(params.userRoundName, 'bm', 'user')),
        raw(BrackhitMatchupsModel.rawSql.selectNextRound(params.compareRoundName, 'bm', 'comp')),
      )
      .leftJoin(userChoices.as('user'), 'bm.choiceId', 'user.choiceId')
      .leftJoin(compareChoices.as('comp'), 'bm.choiceId', 'comp.choiceId')
      .where('bm.brackhitId', brackhitId);

    const meta = this.trackRepo.addTrackInfoToChoices(matchupChoices, params);

    return meta
      .whereRaw(`sub.${params.userRoundName} != sub.${params.compareRoundName}`)
      .orderByRaw(`abs(sub.${params.userRoundName} - sub.${params.compareRoundName}) desc`);
  }

  getResultsWinnerChoices(brackhitId: number) {
    return BrackhitResultsModel.query()
      .alias('br')
      .where('br.brackhitId', brackhitId)
      .where('br.winner', 1);
  }

  getSimilarityBetweenChoices<T extends Model>(
    brackhit: BrackhitWithSize,
    userChoices: QueryBuilder<BrackhitUserChoicesModel, BrackhitUserChoicesModel[]>,
    compareChoices: QueryBuilder<T, T[]>,
  ) {
    return BrackhitUserChoicesModel.query()
      .select(raw(BrackhitUserChoicesModel.rawSql.calculateSimilarity('similarity', 'sub')))
      .from(
        userChoices
          .select(
            raw(
              BrackhitUserChoicesModel.rawSql.selectChoiceSimilarityPoints({
                from: 'buc',
                to: 'comp',
              }),
            ),
          )
          .join(compareChoices.as('comp'), 'buc.roundId', 'comp.roundId')
          .as('sub'),
      )
      .first();
  }

  getUsersBrackhitSimilarity(brackhitId: number, userId: string) {
    const usersChoicesPoints = BrackhitUserChoicesModel.query()
      .alias('compare')
      .select(
        'compare.userId',
        'compare.roundId',
        raw(
          BrackhitUserChoicesModel.rawSql.selectChoiceSimilarityPoints({
            from: 'compare',
            to: 'token',
          }),
        ),
      )
      .join(
        BrackhitUserChoicesModel.getTableNameWithAlias('token'),
        BrackhitUserChoicesModel.callbacks.joinOnBrackhitIdAndRoundIdAndValUserId(userId, {
          from: 'compare',
          to: 'token',
        }),
      )
      .where('compare.brackhitId', brackhitId);

    return BrackhitUserChoicesModel.query()
      .alias('buc')
      .select(
        'choices.userId',
        raw(BrackhitUserChoicesModel.rawSql.calculateSimilarity('similarity', 'choices')),
      )
      .from(usersChoicesPoints.as('choices'))
      .groupBy('choices.userId');
  }

  getBrackhitUsers(data: Partial<BrackhitUserModel>) {
    return BrackhitUserModel.query()
      .alias('bu')
      .select('bu.brackhitId', 'bu.isComplete', 'user.*')
      .joinRelated(expr([Relations.User, 'user']))
      .where(data)
      .orderBy('user.username')
      .castTo<GetBrackhitUsersResponseDto[]>();
  }

  createBrackhitAnswerKey(data: Partial<BrackhitAnswerKeyModel>) {
    return BrackhitAnswerKeyModel.query().insertAndFetch(data).onConflict().merge();
  }

  getBrackhitAds() {
    return BrackhitModel.query()
      .alias('b')
      .joinRelated(expr([Relations.BrackhitAds, 'ba']));
  }

  getDefaultSuggestedBrackhits(brackhitId: number) {
    return BrackhitModel.query()
      .alias('b')
      .join(
        BrackhitDefaultSuggestionsModel.getTableNameWithAlias('bds'),
        BrackhitDefaultSuggestionsModel.callbacks.joinOnBrackhitIdValAndSuggestedBrackhitId(
          brackhitId,
          'b',
          'bds',
        ),
      );
  }

  getBrackhitsWithSameGenre(brackhitId: number) {
    const genresQB = this.getBrackhitGenres(brackhitId);

    return BrackhitModel.query()
      .alias('b')
      .joinRelated(expr([Relations.BrackhitGenres, 'bg']))
      .whereIn('bg.genreId', genresQB.select('genreId'))
      .groupBy('b.brackhitId');
  }

  getBrackhitGenres(brackhitId: number) {
    return BrackhitGenreModel.query().alias('bg').where('bg.brackhitId', brackhitId);
  }

  searchBrackhits(query: string, date: Date) {
    return BrackhitModel.query()
      .alias('b')
      .whereRaw(BrackhitModel.rawSql.whereQueryLike(query, 'b'))
      .where('b.timeLive', '<=', date);
  }

  joinBrackhitMetaToBuilder<T extends Model>(
    builder: QueryBuilder<T, T[]>,
    userId: string,
    params: BrackhitMetaParams,
  ) {
    builder
      .alias('b')
      .select('b.*', 'bt.type', 'bu.isComplete as isCompleted')
      .joinRelated(expr([Relations.Type, 'bt']))
      .leftJoin(
        BrackhitUserModel.getTableNameWithAlias(),
        BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId),
      );

    if (params.fetchOwner) {
      QueryBuilderUtils.fetchRelationsToBuilder(builder, [
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

    return builder;
  }

  getBrackhitTags(brackhitId: number) {
    return BrackhitTagModel.query().alias('bt').where('bt.brackhitId', brackhitId);
  }

  getBrackhitsFtue() {
    return BrackhitFtueModel.query()
      .alias('bf')
      .joinRelated(expr([Relations.Brackhit, 'b'], [Relations.Genre, 'g']))
      .orderBy('bf.hubId');
  }

  getUserFriendsThatCompletedBrackhit(brackhitId: number, userId: string) {
    const [completedUserBrackhits, userFriends] = [
      this.getUsersThatCompletedBrackhit(brackhitId),
      this.userRepository.getUserFriends(userId),
    ];

    return UserProfileInfoModel.query()
      .alias('upi')
      .join(userFriends.as('uf'), 'uf.friendId', 'upi.userId')
      .join(completedUserBrackhits.as('bu'), 'bu.userId', 'upi.userId');
  }

  getBrackhitsTotalShares(columnName: string, params: BrackhitTotalSharesParams) {
    const shares = LogShareModel.query()
      .alias('ls')
      .select('ls.brackhitId')
      .count(`* as ${columnName}`)
      .groupBy('ls.brackhitId');

    if (params.minDate) {
      shares.where('ls.timestamp', '>=', params.minDate);
    }

    return shares;
  }

  // returns brackhits spotify albums and these albums artists
  getBrackhitsSpotifyAlbums() {
    return BrackhitMatchupsModel.query()
      .alias('bm')
      .joinRelated(
        expr([
          Relations.BrackhitContent,
          'bc',
          [Relations.AlbumTrack, 'sat', [Relations.Artists, 'sa']],
        ]),
      )
      .groupBy('bm.brackhitId', 'bc:sat.spotifyArtistId', 'bc:sat.spotifyAlbumId');
  }

  // returns 'One Album brackhits' spotify album and this album artists
  getAlbumBrackhitsSpotifyAlbum() {
    return this.getBrackhitsSpotifyAlbums().havingRaw('count(*) = 16');
  }

  getCustomContentNames(data: Partial<BrackhitCustomContentNameModel>) {
    return BrackhitCustomContentNameModel.query().where(data);
  }

  async findOrCreateBrackhitChoice(data: Partial<BrackhitContentModel>) {
    const content = await BrackhitContentModel.query().findOne(data);
    if (!content) {
      return BrackhitContentModel.query().insertAndFetch(data);
    }
    return content;
  }

  createMatchup(data: Partial<BrackhitMatchupsModel>) {
    return BrackhitMatchupsModel.query().insertAndFetch(data).onConflict().ignore();
  }

  createBrackhit(data: Partial<BrackhitModel>) {
    return BrackhitModel.query().insertAndFetch(data);
  }

  saveYoutubeVideo(data: Partial<YoutubeVideoModel>) {
    return YoutubeVideoModel.query().insert(data).onConflict().merge(['dateInserted']);
  }
}
