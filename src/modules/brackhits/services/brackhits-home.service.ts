import { Injectable } from '@nestjs/common';
import { BrackhitCategory, BrackhitHubs, CategoryType } from '../constants/brackhits-hub.constants';
import {
  BrackhitMetaDto,
  CategoryItemsData,
  GetBrackhitTopUsersQueryDto,
  GetHomeBrackhitsQueryDto,
  GetHomeBrackhitsResponseDto,
  GetTopUsersResponseDto,
  HubItemDto,
  TopUsersParamsDto,
} from '../dto/brackhits-home.dto';
import {
  AWSUsersModel,
  BrackhitCategoriesModel,
  BrackhitHubsModel,
} from '../../../../database/Models';
import { QueryBuilder } from 'objection';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { UsersService } from '../../users/services/users.service';
import {
  GET_FOR_YOU_BRACKHITS_BY_SPOTIFY_RANK,
  GET_FOR_YOU_BRACKHITS_BY_USER_CHOICE,
} from '../queries/brackhits-home.queries';
import { BrackhitHomeUtils } from '../utils/brackhit-home.utils';
import {
  BuilderContainer,
  JoinOperation,
  PaginatedItems,
  PaginationParams,
} from '../../../Tools/dto/util-classes';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import { expr } from '../../../../database/relations/relation-builder';
import { RepositoryService } from '../../repository/services/repository.service';
import { Relations } from '../../../../database/relations/relations';
import { RawSql } from '../../../Tools/utils/raw-sql';
import { CategoryParams } from '../interfaces/brackhits-home.interface';
import { BadRequestError } from '../../../Errors';
import { ErrorConst } from '../../../constants';

@Injectable()
export class BrackhitsHomeService {
  constructor(
    private readonly usersService: UsersService,
    private readonly repoService: RepositoryService,
  ) {}

  async getBrackhitsHomeResponse(
    userId: string,
    query: GetHomeBrackhitsQueryDto,
  ): Promise<GetHomeBrackhitsResponseDto> {
    const home = await this.repoService.brackhitHomeRepo.getBrackhitHome();
    const categoriesData = await this.getBrackhitCategoriesData(home.categoryIds, query);
    await Promise.all(
      categoriesData.items.map((category) =>
        this.getHomeCategoryData(category, userId, query).then((data) => (category.data = data)),
      ),
    );

    return {
      id: home.id,
      name: home.name,
      skip: categoriesData.skip,
      take: categoriesData.take,
      total: categoriesData.total,
      items: BrackhitHomeUtils.parseCategoryCards(categoriesData.items),
    };
  }

  async getBrackhitsHubResponse(
    userId: string,
    hubId: BrackhitHubs,
    query: GetHomeBrackhitsQueryDto,
  ): Promise<GetHomeBrackhitsResponseDto> {
    const hub = await this.repoService.brackhitHomeRepo.getBrackhitHubById(hubId);
    if (!hub) {
      throw new BadRequestError(ErrorConst.INVALID_HUB_ID);
    }

    const categoriesData = await this.getBrackhitCategoriesData(hub.categoryIds, query);
    await Promise.all(
      categoriesData.items.map((category) =>
        this.getHubCategoryData(hub, category, userId, query).then(
          (data) => (category.data = data),
        ),
      ),
    );

    return {
      id: hub.hubId,
      name: hub.hub,
      skip: categoriesData.skip,
      take: categoriesData.take,
      total: categoriesData.total,
      items: BrackhitHomeUtils.parseCategoryCards(categoriesData.items),
    };
  }

  async getFeaturedUsersResponse(
    query: GetBrackhitTopUsersQueryDto,
  ): Promise<GetTopUsersResponseDto> {
    const topUsers = await this.repoService.brackhitHomeRepo.getBrackhitHomeTopUsers();
    const categoriesData = await this.getBrackhitCategoriesData(topUsers.categoryIds, query);
    await Promise.all(
      categoriesData.items.map((category) =>
        this.getTopUsersCategoryData(category, query).then((data) => (category.data = data)),
      ),
    );

    return {
      id: topUsers.id,
      name: topUsers.name,
      skip: categoriesData.skip,
      take: categoriesData.take,
      total: categoriesData.total,
      items: BrackhitHomeUtils.parseCategoryCards(categoriesData.items),
    };
  }

  async getBrackhitsHomeCategoryResponse(
    userId: string,
    query: GetHomeBrackhitsQueryDto,
  ): Promise<GetHomeBrackhitsResponseDto> {
    const [home, category] = await Promise.all([
      this.repoService.brackhitHomeRepo.getBrackhitHome(),
      this.repoService.brackhitHomeRepo.getBrackhitCategory(query.categoryId),
    ]);

    if (!category) {
      throw new BadRequestError(ErrorConst.INVALID_HOME_CATEGORY_ID);
    }

    category.data = await this.getHomeCategoryData(category, userId, query);

    return {
      id: home.id,
      name: home.name,
      skip: 0,
      take: 1,
      total: 1,
      items: BrackhitHomeUtils.parseCategoryCards([category]),
    };
  }

  async getFeaturedUsersCategoryResponse(
    query: GetBrackhitTopUsersQueryDto,
  ): Promise<GetTopUsersResponseDto> {
    const [users, category] = await Promise.all([
      this.repoService.brackhitHomeRepo.getBrackhitHomeTopUsers(),
      this.repoService.brackhitHomeRepo.getBrackhitCategory(query.categoryId),
    ]);
    category.data = await this.getTopUsersCategoryData(category, query);

    return {
      id: users.id,
      name: users.name,
      skip: 0,
      take: 1,
      total: 1,
      items: BrackhitHomeUtils.parseCategoryCards([category]),
    };
  }

  async getBrackhitsHubCategoryResponse(
    userId: string,
    hubId: BrackhitHubs,
    query: GetHomeBrackhitsQueryDto,
  ): Promise<GetHomeBrackhitsResponseDto> {
    const [hub, category] = await Promise.all([
      this.repoService.brackhitHomeRepo.getBrackhitHubById(hubId),
      this.repoService.brackhitHomeRepo.getBrackhitCategory(query.categoryId),
    ]);

    if (!hub) {
      throw new BadRequestError(ErrorConst.INVALID_HUB_ID);
    }

    if (!category) {
      throw new BadRequestError(ErrorConst.INVALID_HUB_CATEGORY_ID);
    }

    category.data = await this.getHubCategoryData(hub, category, userId, query);

    return {
      id: hub.hubId,
      name: hub.hub,
      skip: 0,
      take: 1,
      total: 1,
      items: BrackhitHomeUtils.parseCategoryCards([category]),
    };
  }

  async getBrackhitCategoriesData(
    categoryIds: string,
    params: PaginationParams,
  ): Promise<PaginatedItems<BrackhitCategoriesModel>> {
    const categoriesQB = this.repoService.brackhitHomeRepo.getBrackhitCategories(categoryIds);
    const totalQB = categoriesQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(categoriesQB, params);
    categoriesQB.orderByRaw(RawSql.orderByFieldId('bc', categoryIds));

    const [categories, total] = await Promise.all([categoriesQB, totalQB]);

    return {
      skip: params.skip,
      take: params.take,
      total: total,
      items: categories,
    };
  }

  async getCategoryBrackhits(
    category: BrackhitCategoriesModel,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): Promise<BuilderContainer<BrackhitModel>> {
    const categoryId = category.id;
    let brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>;

    if (categoryId === BrackhitCategory.Featured) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getFeaturedBrackhits();
    } else if (categoryId === BrackhitCategory.Trending) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getTrendingBrackhits(userId, date);
    } else if (categoryId === BrackhitCategory.Popular) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getBrackhits();
    } else if (categoryId === BrackhitCategory.FromArtistory) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getFromArtistoryBrackhits();
    } else if (categoryId === BrackhitCategory.ForYou) {
      const query = await this.getForYouBrackhitsSqlQuery(userId);
      brackhitsQB = this.repoService.brackhitHomeRepo.getForYouBrackhits(query, userId, {
        ...params,
        onlyNoneStatus: params.preview,
      });
    } else if (categoryId === BrackhitCategory.MadeByFans) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getMadeByFansBrackhits();
    } else if (categoryId === BrackhitCategory.FromYourFriends) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getFromYourFriendsBrackhits(userId);
    } else if (categoryId === BrackhitCategory.MyBrackhits) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getMyBrackhits(userId);
    } else if (categoryId === BrackhitCategory.AllTimeFavorites) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getBrackhits();
    } else if (categoryId === BrackhitCategory.InProgress) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getInProgressBrackhits(userId);
    } else if (categoryId === BrackhitCategory.FromMyArtists) {
      brackhitsQB = this.repoService.brackhitHomeRepo.getFromMyArtistsBrackhits(userId, category);
    }

    // a trick to call async function which returns QueryBuilder object without resolving returning builder into a Model
    return { items: brackhitsQB };
  }

  async getHomeCategoryData(
    category: BrackhitCategoriesModel,
    userId: string,
    query: GetHomeBrackhitsQueryDto,
  ): Promise<CategoryItemsData> {
    const params = BrackhitHomeUtils.getCategoryParams(category, query);

    if (category.type === CategoryType.Category) {
      return this.getCategoryCardData(category, userId, query.date, params);
    } else if (category.type === CategoryType.Genre) {
      return this.getGenreCardData(category, userId, query.date, params);
    } else if (category.type === CategoryType.Tag) {
      return this.getTagCardData(category, userId, query.date, params);
    } else if (category.type === CategoryType.Hubs) {
      return this.getHubsCardData(category, params);
    } else if (category.type === CategoryType.Users) {
      return this.getUserCardData(category, params);
    } else {
      return undefined;
    }
  }

  async getHubCategoryData(
    hub: BrackhitHubsModel,
    category: BrackhitCategoriesModel,
    userId: string,
    query: GetHomeBrackhitsQueryDto,
  ): Promise<CategoryItemsData> {
    const params = BrackhitHomeUtils.getCategoryParams(category, query);
    const hubBrackhitsQB = this.repoService.brackhitHomeRepo.getHubBrackhits(hub);

    if (category.type === CategoryType.Category) {
      return this.getHubCategoryCardData(
        hubBrackhitsQB,
        category,
        hub.hubId,
        userId,
        query.date,
        params,
      );
    } else if (category.type === CategoryType.Genre) {
      return this.getHubGenreCardData(hubBrackhitsQB, category, userId, query.date, params);
    } else if (category.type === CategoryType.Tag) {
      return this.getHubTagCardData(hubBrackhitsQB, category, userId, query.date, params);
    } else {
      return undefined;
    }
  }

  async getTopUsersCategoryData(
    category: BrackhitCategoriesModel,
    query: GetBrackhitTopUsersQueryDto,
  ): Promise<CategoryItemsData> {
    const params = BrackhitHomeUtils.getCategoryParams(category, query);
    return this.getUserCardData(category, params);
  }

  async getUserCardData(
    category: BrackhitCategoriesModel,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    let usersQB: QueryBuilder<AWSUsersModel, AWSUsersModel[]>;

    if (category.id === BrackhitCategory.MostBrackhitCompletions) {
      usersQB = this.repoService.userRepo.getUsersWithTotalCompletions();
    } else if (category.id === BrackhitCategory.TopCreators) {
      usersQB = this.repoService.userRepo.getUsersWithTotalVotes();
    } else if (category.id === BrackhitCategory.SuperFans) {
      const topUsersParams = await this.getTopUsersParams();
      const featuredUsers = await this.repoService.userRepo.getFeaturedUsers(topUsersParams);
      usersQB = this.repoService.userRepo.filterTopAwsUsers(featuredUsers);
    } else {
      return undefined;
    }

    return this.modifyCategoryUsers(usersQB, category, params);
  }

  async getCategoryCardData(
    category: BrackhitCategoriesModel,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    const data = await this.getCategoryBrackhits(category, userId, date, params);

    return this.modifyCategoryBrackhits(data?.items, category, userId, date, params);
  }

  async getGenreCardData(
    category: BrackhitCategoriesModel,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    const genreBrackhitsQB = this.repoService.brackhitRepo.getBrackhitsByMasterGenre(
      category.sourceId,
    );

    return this.modifyCategoryBrackhits(genreBrackhitsQB, category, userId, date, params);
  }

  async getTagCardData(
    category: BrackhitCategoriesModel,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    const tagBrackhitsQB = this.repoService.brackhitRepo.getTagBrackhits(category.sourceId);

    return this.modifyCategoryBrackhits(tagBrackhitsQB, category, userId, date, params);
  }

  async getHubCategoryCardData(
    hubBrackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
    hubId: BrackhitHubs,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    const data = await this.getCategoryBrackhits(category, userId, date, params);

    return this.modifyHubCategoryBrackhits(
      data.items,
      hubBrackhitsQB,
      category,
      userId,
      date,
      params,
    );
  }

  async getHubGenreCardData(
    hubBrackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    const genreBrackhitsQB = this.repoService.brackhitRepo.getBrackhitsByMasterGenre(
      category.sourceId,
    );

    return this.modifyHubCategoryBrackhits(
      genreBrackhitsQB,
      hubBrackhitsQB,
      category,
      userId,
      date,
      params,
    );
  }

  async getHubTagCardData(
    hubBrackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    const tagBrackhitsQB = this.repoService.brackhitRepo.getTagBrackhits(category.sourceId);

    return this.modifyHubCategoryBrackhits(
      tagBrackhitsQB,
      hubBrackhitsQB,
      category,
      userId,
      date,
      params,
    );
  }

  // Returns appropriate query to get ForYou brackhits, depending on whether the user has connected spotify account
  async getForYouBrackhitsSqlQuery(userId: string): Promise<string> {
    const spotifyToken = await this.usersService.getSpotifyUserToken(userId);

    if (spotifyToken) {
      return GET_FOR_YOU_BRACKHITS_BY_SPOTIFY_RANK;
    } else {
      return GET_FOR_YOU_BRACKHITS_BY_USER_CHOICE;
    }
  }

  applyCategoryOptionsToBrackhits(
    brackhits: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): void {
    // totalQB is not calculated in preview mode, therefore any query modifications do not influence total counter
    if (params.preview) {
      this.repoService.brackhitHomeRepo.applyDisplayCompletedToCategoryBrackhits(
        brackhits,
        category,
      );
      this.repoService.brackhitHomeRepo.applyMinCompletionsToCategoryBrackhits(brackhits, category);
    }

    this.repoService.brackhitHomeRepo.sortCategoryItems(brackhits, category, date, params);
  }

  applyCategoryOptionsToUsers(
    users: QueryBuilder<AWSUsersModel, AWSUsersModel[]>,
    category: BrackhitCategoriesModel,
    params: CategoryParams,
  ): void {
    this.repoService.brackhitHomeRepo.sortCategoryItems(users, category, null, params);
  }

  async modifyHubCategoryBrackhits(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    hubBrackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    if (!brackhitsQB || !hubBrackhitsQB) return undefined;

    brackhitsQB.join(hubBrackhitsQB.as('sub'), 'b.brackhitId', 'sub.brackhitId');

    return this.modifyCategoryBrackhits(brackhitsQB, category, userId, date, params);
  }

  async modifyCategoryBrackhits(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    category: BrackhitCategoriesModel,
    userId: string,
    date: Date,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    if (!brackhitsQB) return undefined;

    if (BrackhitHomeUtils.isCategoryArtistLimitEnabled(category, params)) {
      brackhitsQB = this.repoService.brackhitHomeRepo.limitCategoryBrackhitsPerArtist(
        brackhitsQB,
        category,
        date,
      );
    }

    this.repoService.brackhitRepo.removeDailyBrackhitsFromBrackhitsQB(brackhitsQB);
    this.repoService.brackhitHomeRepo.leftJoinBrackhitUserToBrackhits(brackhitsQB, userId, 'bu');
    brackhitsQB.select(
      'b.brackhitId',
      'b.name',
      'b.thumbnail',
      'b.timeLive',
      'b.duration',
      'b.scoringState',
      'bu.isComplete as isCompleted',
    );
    QueryBuilderUtils.excludeNotStartedBrackhits(brackhitsQB, date);
    QueryBuilderUtils.excludeHiddenBrackhits(brackhitsQB);

    const totalQB = params.preview ? undefined : brackhitsQB.clone().resultSize();

    this.applyCategoryOptionsToBrackhits(brackhitsQB, category, userId, date, params);
    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, params);

    const [brackhits, total] = await Promise.all([
      brackhitsQB.castTo<BrackhitMetaDto[]>(),
      totalQB,
    ]);

    return {
      skip: params.skip,
      take: params.take,
      total: params.preview ? brackhits.length : total,
      items: BrackhitHomeUtils.parseBrackhitItems(brackhits, date),
    };
  }

  async modifyCategoryUsers(
    usersQB: QueryBuilder<AWSUsersModel, AWSUsersModel[]>,
    category: BrackhitCategoriesModel,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    const totalQB = params.preview ? undefined : usersQB.clone().resultSize();

    // to sort by username
    usersQB.joinRelated(expr([Relations.Profile, 'upi']));
    QueryBuilderUtils.fetchRelationsToBuilder(usersQB, [
      {
        relation: Relations.Profile,
        alias: 'upi',
        select: [
          'upi.userId',
          'upi.username',
          'upi.firstName',
          'upi.lastName',
          'upi.userImage',
          'ui.typeId as influencerType',
        ],
        children: [
          {
            relation: expr([Relations.UserInfluencer, 'ui']),
            join: JoinOperation.leftJoin,
          },
        ],
      },
    ]);
    this.applyCategoryOptionsToUsers(usersQB, category, params);
    QueryBuilderUtils.addPaginationToBuilder(usersQB, params);

    const [users, total] = await Promise.all([
      this.repoService.userRepo.castAwsUsersUserItems(usersQB, category.id),
      totalQB,
    ]);

    return {
      skip: params.skip,
      take: params.take,
      total: params.preview ? users.length : total,
      items: users,
    };
  }

  async getHubsCardData(
    category: BrackhitCategoriesModel,
    params: CategoryParams,
  ): Promise<CategoryItemsData> {
    const hubsQB = this.repoService.brackhitHomeRepo.getBrackhitHubs();
    const totalQB = hubsQB.clone().resultSize();
    // category offset starts from 1, instead of 0
    const categoryOffset = category.offset - 1;
    params.skip = params.preview ? categoryOffset : params.skip + categoryOffset;

    QueryBuilderUtils.addPaginationToBuilder(hubsQB, params);
    hubsQB.select('hubId as id', 'hub as name', 'color').orderBy('position');

    const [hubs, total] = await Promise.all([hubsQB.castTo<HubItemDto[]>(), totalQB]);

    return {
      skip: params.skip,
      take: params.take,
      total,
      items: hubs,
    };
  }

  async getTopUsersParams(): Promise<TopUsersParamsDto> {
    const [completions, votes] = await Promise.all([
      this.repoService.brackhitHomeRepo.getBrackhitCategory(
        BrackhitCategory.MostBrackhitCompletions,
      ),
      this.repoService.brackhitHomeRepo.getBrackhitCategory(BrackhitCategory.TopCreators),
    ]);

    return {
      completionUsersCount: completions.previewCount,
      voteUsersCount: votes.previewCount,
    };
  }
}
