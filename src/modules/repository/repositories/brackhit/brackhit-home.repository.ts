import { Injectable } from '@nestjs/common';
import {
  BRACKHIT_TRENDING_PERIOD,
  BrackhitCategory,
  BrackhitHubs,
  BrackhitHubTypes,
  CategorySortingType,
} from '../../../brackhits/constants/brackhits-hub.constants';
import {
  BrackhitCategoriesModel,
  BrackhitHomeModel,
  BrackhitHubsModel,
  UserFriendsModel,
} from '../../../../../database/Models';
import { BrackhitModel } from '../../../../../database/Models/BrackhitModel';
import { DateUtils } from '../../../../Tools/utils/date-utils';
import { ForYouBrackhitsParamsDto } from '../../../brackhits/dto/brackhits-home.dto';
import { Model, QueryBuilder, raw } from 'objection';
import { BrackhitUserModel } from '../../../../../database/Models/BrackhitUserModel';
import { BrackhitRepository } from './brackhit.repository';
import { BrackhitCommentRepository } from './brackhit-comment.repository';
import { UserRepository } from '../user/user.repository';
import { ConstantsRepository } from '../../../constants/repository/constants.repository';
import { ConstantId } from '../../../constants/constants';
import { QueryBuilderUtils } from '../../../../Tools/utils/query-builder.utils';
import { expr } from '../../../../../database/relations/relation-builder';
import { Relations } from '../../../../../database/relations/relations';
import { CATEGORY_BRACKHITS_WITH_ARTISTS } from '../../../brackhits/constants/brackhits-home.constants';
import {
  CategoryParams,
  CategorySortingParams,
} from '../../../brackhits/interfaces/brackhits-home.interface';
import { BrackhitHomeUtils } from '../../../brackhits/utils/brackhit-home.utils';

@Injectable()
export class BrackhitHomeRepository {
  constructor(
    private readonly brackhitRepo: BrackhitRepository,
    private readonly brackhitCommentRepo: BrackhitCommentRepository,
    private readonly userRepo: UserRepository,
    private readonly constantsRepo: ConstantsRepository,
  ) {}

  getBrackhitHubById(hubId: BrackhitHubs) {
    return BrackhitHubsModel.query().findById(hubId);
  }

  getBrackhitHubs() {
    return BrackhitHubsModel.query();
  }

  getBrackhitHome() {
    return BrackhitHomeModel.query().findById(1);
  }

  getBrackhitHomeTopUsers() {
    return BrackhitHomeModel.query().findById(2);
  }

  // categoryIds must be comma separated string of ids without whitespaces: "1,2,3,4,5"
  getBrackhitCategories(categoryIds: string) {
    return BrackhitCategoriesModel.query()
      .alias('bc')
      .select(
        'bc.*',
        'bcs1.type as sortingType',
        'bcs1.days',
        'bcs2.type as artistLimitSortingType',
        'bcs2.days as artistLimitDays',
      )
      .leftJoinRelated(expr([Relations.Sort, 'bcs1'], [Relations.ArtistLimitSort, 'bcs2']))
      .whereIn('bc.id', categoryIds.split(','));
  }

  getHubBrackhits(hub: BrackhitHubsModel) {
    if (hub.type === BrackhitHubTypes.Tag) {
      return this.brackhitRepo.getTagBrackhits(hub.sourceId);
    } else if (hub.type === BrackhitHubTypes.Genre) {
      return this.brackhitRepo.getBrackhitsByMasterGenre(hub.sourceId);
    } else {
      return this.brackhitRepo.getArtistoryBrackhits();
    }
  }

  getFeaturedBrackhits() {
    return BrackhitModel.query().alias('b').where('b.featured', 1);
  }

  getTrendingBrackhits(userId: string, userTime: Date) {
    const trendingTime = DateUtils.subtractHoursFromDate(userTime, BRACKHIT_TRENDING_PERIOD);

    return BrackhitModel.query()
      .alias('b')
      .leftJoinRelated('brackhitUser as bu2')
      .where('b.featured', 0)
      .whereBetween('bu2.updatedAt', [trendingTime, userTime])
      .groupBy('b.brackhitId');
  }

  getBrackhits() {
    return BrackhitModel.query().alias('b');
  }

  getFromArtistoryBrackhits() {
    return BrackhitModel.query().alias('b').where('b.ownerId', 'artistory');
  }

  // Executes ForYou brackhits query and returns QueryBuilder object
  getForYouBrackhits(query: string, userId: string, params: ForYouBrackhitsParamsDto) {
    const brackhitQB = BrackhitModel.query()
      .alias('b')
      .from(raw(`(${query})`, { userId }).as('b'))
      .orderBy('b.rank', 'desc');

    if (params.onlyNoneStatus) {
      brackhitQB.whereNull('b.isComplete');
    }

    return brackhitQB;
  }

  getMadeByFansBrackhits() {
    return BrackhitModel.query().alias('b').whereNot('b.ownerId', 'artistory');
  }

  leftJoinBrackhitUserToBrackhits(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    userId: string,
    alias: string,
  ) {
    brackhitsQB.leftJoin(
      BrackhitUserModel.getTableNameWithAlias(alias),
      BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId),
    );
  }

  sortCategoryItemsBySortingParams<T extends Model>(
    items: QueryBuilder<T, T[]>,
    params: CategorySortingParams,
  ) {
    if (params.sortingType === CategorySortingType.BrackhitId) {
      items.orderBy('b.brackhitId', 'desc');
    } else if (params.sortingType === CategorySortingType.Completions) {
      this.applySortingByCompletionsToCategoryItems(items, params);
    } else if (params.sortingType === CategorySortingType.UserValue) {
      items.orderByRaw('user_value desc').orderBy('upi.username');
    } else if (params.sortingType === CategorySortingType.Comments) {
      this.applySortingByCommentsToCategoryItems(items, params);
    } else if (params.sortingType === CategorySortingType.Shares) {
      this.applySortingBySharesToCategoryItems(items, params);
    } else if (params.sortingType === CategorySortingType.Random) {
      items.orderByRaw('rand()');
    }
  }

  sortCategoryItemsWithSameArtistLimitSortingId<T extends Model>(
    items: QueryBuilder<T, T[]>,
    category: BrackhitCategoriesModel,
  ) {
    if (category.artistLimitDays) {
      items.orderBy('filtered.sortingValue', 'desc').orderBy('b.brackhitId', 'desc');
    } else {
      this.sortCategoryItemsBySortingParams(items, {
        sortingType: category.artistLimitSortingType,
      });
    }
  }

  sortCategoryItems<T extends Model>(
    items: QueryBuilder<T, T[]>,
    category: BrackhitCategoriesModel,
    date: Date,
    params: CategoryParams,
  ) {
    if (
      BrackhitHomeUtils.isCategoryArtistLimitEnabled(category, params) &&
      category.sortingId === category.artistLimitSortId
    ) {
      this.sortCategoryItemsWithSameArtistLimitSortingId(items, category);
    } else {
      this.sortCategoryItemsBySortingParams(items, {
        sortingType: category.sortingType,
        days: category.days,
        date,
      });
    }
  }

  applySortingByCompletionsToCategoryItems<T extends Model>(
    items: QueryBuilder<T, T[]>,
    params: CategorySortingParams,
  ): void {
    const completions = this.brackhitRepo.getBrackhitsCompletionsInLastXDays(
      params.date,
      params.days,
    );

    items
      .select('lastCompletions.completions as sortingValue')
      .join(completions.as('lastCompletions'), 'lastCompletions.brackhitId', 'b.brackhitId')
      .orderBy('lastCompletions.completions', 'desc')
      .orderBy('b.brackhitId', 'desc');
  }

  applySortingByCommentsToCategoryItems<T extends Model>(
    items: QueryBuilder<T, T[]>,
    params: CategorySortingParams,
  ): void {
    const minDate = DateUtils.subtractDaysFromDate(params.date, params.days);
    const totalComments = this.brackhitCommentRepo.getBrackhitsTotalCommentsAndReplies('total', {
      minDate,
    });

    items
      .select('totalComments.total as sortingValue')
      .join(totalComments.as('totalComments'), 'totalComments.brackhitId', 'b.brackhitId')
      .orderBy('totalComments.total', 'desc')
      .orderBy('b.brackhitId', 'desc');
  }

  applySortingBySharesToCategoryItems<T extends Model>(
    items: QueryBuilder<T, T[]>,
    params: CategorySortingParams,
  ): void {
    const minDate = DateUtils.subtractDaysFromDate(params.date, params.days);
    const totalShares = this.brackhitRepo.getBrackhitsTotalShares('total', { minDate });

    items
      .select('totalShares.total as sortingValue')
      .leftJoin(totalShares.as('totalShares'), 'totalShares.brackhitId', 'b.brackhitId')
      .orderBy('totalShares.total', 'desc')
      .orderBy('b.brackhitId', 'desc');
  }

  applyDisplayCompletedToCategoryBrackhits(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
  ): void {
    if (category.displayCompleted === 0) {
      brackhitsQB.where(BrackhitUserModel.callbacks.whereIsCompleteZeroOrNull('bu'));
    }
  }

  // TODO: can be removed since this column does not exist on prod
  applyMinCompletionsToCategoryBrackhits(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
  ): void {
    if (category.minCompletions) {
      const completionsQB = this.brackhitRepo.getBrackhitsCompletions('completions');
      brackhitsQB
        .join(completionsQB.as('comp'), 'comp.brackhitId', 'b.brackhitId')
        .where('comp.completions', '>=', category.minCompletions);
    }
  }

  getBrackhitCategory(id: BrackhitCategory) {
    return this.getBrackhitCategories(id.toString()).findById(id);
  }

  getFromYourFriendsBrackhits(userId: string) {
    return BrackhitModel.query()
      .alias('b')
      .join(UserFriendsModel.getTableNameWithAlias('uf'), function () {
        this.on('uf.friendId', 'b.ownerId').andOnVal('uf.userId', userId);
      });
  }

  getMyBrackhits(userId: string) {
    return BrackhitModel.query().alias('b').where('b.ownerId', userId);
  }

  getInProgressBrackhits(userId: string) {
    return BrackhitModel.query()
      .alias('b')
      .where('bu.userId', userId)
      .where('bu.isComplete', 0)
      .whereNull('bu.initialCompleteTime');
  }

  getFromMyArtistsBrackhits(userId: string, category: BrackhitCategoriesModel) {
    const [completions, notCompletedBrackhits, userFeed, completionsConst] = [
      this.brackhitRepo.getBrackhitsCompletions('completions'),
      this.userRepo.getUserNotCompletedBrackhits(userId),
      this.userRepo.getUserFeedPreferences(userId),
      this.constantsRepo.getConstant(ConstantId.MY_ARTISTS_BRACKHITS_MIN_COMPLETIONS),
    ];

    const brackhits = BrackhitModel.query()
      .alias('b')
      .joinRelated(expr([Relations.BrackhitArtists, 'ba']))
      .join(userFeed.as('ufp'), 'ufp.artistId', 'ba.artistId')
      .join(notCompletedBrackhits.as('not_comp'), 'not_comp.brackhitId', 'b.brackhitId')
      .join(completions.as('comp'), 'comp.brackhitId', 'b.brackhitId')
      .where('comp.completions', '>=', completionsConst.select('value'));

    if (!category.artistLimit) {
      brackhits.groupBy('b.brackhitId');
    }

    return brackhits;
  }

  limitCategoryBrackhitsPerArtist(
    brackhits: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
    date: Date,
  ) {
    if (!CATEGORY_BRACKHITS_WITH_ARTISTS.includes(category.id)) {
      brackhits.joinRelated(expr([Relations.BrackhitArtists, 'ba']));
    }
    // first results are sorted by artistId and mandatory columns are selected
    brackhits.select('b.brackhitId', 'ba.artistId').orderBy('ba.artistId');
    // then brackhits in each group are sorted by artistLimitSortingType column
    this.sortCategoryItemsBySortingParams(brackhits, {
      sortingType: category.artistLimitSortingType,
      days: category.artistLimitDays,
      date,
    });

    const rankedBrackhits = this.rankCategoryBrackhits(brackhits, category);

    const filteredBrackhits = BrackhitModel.query()
      .alias('ranked')
      .from(rankedBrackhits.as('ranked'))
      .groupBy('ranked.brackhitId')
      .where('ranked.itemRank', '<=', category.artistLimit);

    return BrackhitModel.query()
      .alias('b')
      .join(filteredBrackhits.as('filtered'), 'filtered.brackhitId', 'b.brackhitId');
  }

  rankCategoryBrackhits(
    brackhits: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
  ) {
    if (category.id === BrackhitCategory.Albums) {
      return this.rankAlbumBrackhits(brackhits);
    } else {
      return QueryBuilderUtils.rankItemsByGroupColumn(brackhits, {
        rankColumnName: 'itemRank',
        groupColumnRaw: 'artist_id',
      });
    }
  }

  // album brackhits are limited by number of albums per artist
  rankAlbumBrackhits(brackhits: QueryBuilder<BrackhitModel, BrackhitModel[]>) {
    const brackhitsAlbums = this.brackhitRepo
      .getAlbumBrackhitsSpotifyAlbum()
      .select('bm.brackhitId', 'artistId', 'spotifyAlbumId');

    brackhits.join(brackhitsAlbums.as('albums'), function () {
      this.on('albums.brackhitId', 'b.brackhitId').andOn('albums.artistId', 'ba.artistId');
    });

    return QueryBuilderUtils.rankItemsByGroupColumn(brackhits, {
      rankColumnName: 'itemRank',
      groupColumnRaw: 'artist_id',
    });
  }
}
