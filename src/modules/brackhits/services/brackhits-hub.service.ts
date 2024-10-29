import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BRACKHIT_CATEGORY_GENRES_MAP,
  BRACKHIT_HOME_CATEGORIES,
  BRACKHIT_HOME_HUBS,
  BRACKHIT_HOME_TAG_CARD_COUNT,
  BRACKHIT_HOME_TAGS,
  BRACKHIT_HUB_CATEGORIES,
  BRACKHIT_HUB_TAG_CARD_COUNT,
  BRACKHIT_HUB_TAG_MAP,
  BRACKHIT_SPECIAL_HUB_CATEGORIES,
  BrackhitCategory,
  BrackhitEraHubs,
  BrackhitGenreCategories,
  BrackhitHubs,
  BrackhitSpecialHubs,
  BrackhitTags,
  CategoryType,
  ERA_HUB_CATEGORIES_ORDER,
  HOME_CATEGORIES_ORDER,
  HUB_CARDS_ORDER,
  HUB_CATEGORIES_ORDER,
  MBF_HUB_CATEGORIES_ORDER,
  NO_CATEGORIES_ORDER,
} from '../constants/brackhits-hub.constants';
import {
  BrackhitCardDto,
  BrackhitHomeHubsDto,
  BrackhitHubItemDto,
  BrackhitHubMetaDto,
  BrackhitHubsCardDto,
  BrackhitItemPreviewDto,
  BrackhitsCardParamsDto,
  ForYouBrackhitsParamsDto,
} from '../dto/brackhits-hub.dto';
import { BrackhitsHubUtils } from '../utils/brackhits-hub.utils';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { QueryBuilder } from 'objection';
import { UsersService } from '../../users/services/users.service';
import { BadRequestError } from '../../../Errors';
import { DEFAULT_BRACKHIT_IMAGE, ErrorConst } from '../../../constants';
import { AppSettingsService } from '../../../Services/AppSettings/AppSettingsService';
import { RepositoryService } from '../../repository/services/repository.service';

@Injectable()
export class BrackhitsHubService {
  constructor(
    private readonly usersService: UsersService,
    private readonly repositoryService: RepositoryService,
  ) {}

  async getBrackhitsHomeData(
    userId: string,
    userTime: Date,
  ): Promise<(BrackhitCardDto | BrackhitHomeHubsDto | BrackhitCardDto[])[]> {
    const [categories, hubs, tags] = await Promise.all([
      this.getCategoriesCardsForHome(),
      this.getHomeHubs(),
      this.getTagCardsForHome(),
    ]);

    await this.joinBrackhitsToHomeCardsPreview(userId, userTime, categories, tags);

    return [categories[0], hubs, categories.slice(1, categories.length).concat(tags)]; // [featured, hubs, other categories]
  }

  async getBrackhitsHubData(
    hubId: BrackhitHubs,
    userId: string,
    userTime: Date,
  ): Promise<BrackhitCardDto[]> {
    const [categories, tags] = await Promise.all([
      this.getCategoriesCardsForHub(hubId),
      this.getTagCardsForHub(hubId),
    ]);

    await this.joinBrackhitsToHubCardsPreview(hubId, userId, userTime, categories, tags);

    return categories.concat(tags);
  }

  async getCategoriesCardsForHome(): Promise<BrackhitCardDto[]> {
    return this.repositoryService.brackhitHubRepo
      .getBrackhitCategoriesQB(BRACKHIT_HOME_CATEGORIES, HOME_CATEGORIES_ORDER)
      .select('id', 'categoryName as name', 'type', 'cardType')
      .castTo<BrackhitCardDto[]>();
  }

  async getCategoriesCardsForHub(hubId?: BrackhitHubs): Promise<BrackhitCardDto[]> {
    let ids, order;

    if (BrackhitEraHubs.includes(hubId)) {
      [ids, order] = [BRACKHIT_SPECIAL_HUB_CATEGORIES, ERA_HUB_CATEGORIES_ORDER];
    } else if (hubId === BrackhitHubs.MadeByFans) {
      [ids, order] = [BRACKHIT_SPECIAL_HUB_CATEGORIES, MBF_HUB_CATEGORIES_ORDER];
    } else {
      [ids, order] = [BRACKHIT_HUB_CATEGORIES, HUB_CATEGORIES_ORDER];
    }

    return this.repositoryService.brackhitHubRepo
      .getBrackhitCategoriesQB(ids, order)
      .select('id', 'categoryName as name', 'type', 'cardType')
      .castTo<BrackhitCardDto[]>();
  }

  async getCategoryCardById(categoryId: BrackhitCategory): Promise<BrackhitCardDto> {
    return this.repositoryService.brackhitHubRepo
      .getBrackhitCategoriesQB([categoryId], NO_CATEGORIES_ORDER)
      .select('id', 'categoryName as name', 'type', 'cardType')
      .first()
      .castTo<BrackhitCardDto>();
  }

  async getTagCardsForHome(): Promise<BrackhitCardDto[]> {
    const tags = await this.repositoryService.brackhitHubRepo
      .getBrackhitTagTypesQB(BRACKHIT_HOME_TAGS)
      .select('tagId as id', 'tag as name')
      .castTo<BrackhitCardDto[]>();

    tags.forEach((tag) => {
      tag.cardType = 2;
      tag.type = CategoryType.Tag;
    });

    return tags;
  }

  async getTagCardsForHub(hubId?: BrackhitHubs): Promise<BrackhitCardDto[]> {
    const ids = BRACKHIT_HUB_TAG_MAP.get(hubId) || [];

    const tags = await this.repositoryService.brackhitHubRepo
      .getBrackhitTagTypesQB(ids)
      .select('tagId as id', 'tag as name')
      .castTo<BrackhitCardDto[]>();

    tags.forEach((tag) => {
      tag.cardType = 2;
      tag.type = CategoryType.Tag;
    });

    return tags;
  }

  async getTagCardById(tagId: BrackhitTags): Promise<BrackhitCardDto> {
    const tag = await this.repositoryService.brackhitHubRepo
      .getBrackhitTagTypesQB([tagId])
      .select('tagId as id', 'tag as name')
      .first()
      .castTo<BrackhitCardDto>();

    tag.cardType = 2;
    tag.type = CategoryType.Tag;

    return tag;
  }

  async getHomeHubs(): Promise<BrackhitHomeHubsDto> {
    const [ids, order] = [BRACKHIT_HOME_HUBS, HUB_CARDS_ORDER];
    const hubs = await this.repositoryService.brackhitHubRepo.filterBrackhitHubsByIds(ids, order);

    return {
      name: 'Hubs',
      hubs,
    };
  }

  async joinBrackhitsToHomeCardsPreview(
    userId: string,
    userTime: Date,
    categories: BrackhitCardDto[],
    tags: BrackhitCardDto[],
  ): Promise<void> {
    const categoryPromises = categories.map((category) => {
      return this.joinBrackhitsToHomeCategoryCard(category, userId, userTime, {
        takeAll: false,
      });
    });

    const tagPromises = tags.map((tag) => {
      return this.joinBrackhitsToHomeTagCard(tag, userId, userTime, {
        takeAll: false,
      });
    });

    await Promise.all(categoryPromises.concat(tagPromises));
  }

  async joinBrackhitsToHubCardsPreview(
    hubId: BrackhitHubs,
    userId: string,
    userTime: Date,
    categories: BrackhitCardDto[],
    tags: BrackhitCardDto[],
  ): Promise<void> {
    const categoryPromises = categories.map((category) => {
      return this.joinBrackhitsToHubCategoryCard(category, hubId, userId, userTime, {
        takeAll: false,
      });
    });

    const tagPromises = tags.map((tag) => {
      return this.joinBrackhitsToHubTagCard(tag, hubId, userId, userTime, {
        takeAll: false,
      });
    });

    await Promise.all(categoryPromises.concat(tagPromises));
  }

  async joinBrackhitsToHomeCategoryCard(
    category: BrackhitCardDto,
    userId: string,
    userTime: Date,
    params: BrackhitsCardParamsDto,
  ): Promise<void> {
    category.brackhits = await this.getBrackhitsForHomeCategoryCard(
      category.id,
      userTime,
      userId,
      params,
    );
  }

  async joinBrackhitsToHomeTagCard(
    tag: BrackhitCardDto,
    userId: string,
    userTime: Date,
    params: BrackhitsCardParamsDto,
  ): Promise<void> {
    tag.brackhits = await this.getBrackhitsForHomeTagCard(tag.id, userId, userTime, params);
  }

  async joinBrackhitsToHubCategoryCard(
    category: BrackhitCardDto,
    hubId: BrackhitHubs,
    userId: string,
    userTime: Date,
    params: BrackhitsCardParamsDto,
  ): Promise<void> {
    category.brackhits = await this.getBrackhitsForHubCategoryCard(
      category.id,
      hubId,
      userTime,
      userId,
      params,
    );
  }

  async joinBrackhitsToHubTagCard(
    tag: BrackhitCardDto,
    hubId: BrackhitHubs,
    userId: string,
    userTime: Date,
    params: BrackhitsCardParamsDto,
  ): Promise<void> {
    tag.brackhits = await this.getBrackhitsForHubTagCard(tag.id, hubId, userId, userTime, params);
  }

  async getBrackhitsForHomeCategoryCard(
    categoryId: BrackhitCategory,
    userTime: Date,
    userId: string,
    params: BrackhitsCardParamsDto,
  ): Promise<BrackhitItemPreviewDto[]> {
    const take = params.takeAll
      ? BrackhitsHubUtils.getCategoryCardFullBrackhitsCount(categoryId)
      : BrackhitsHubUtils.getHomeCategoryPreviewBrackhitsCount(categoryId);

    let brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>;

    if (categoryId === BrackhitCategory.Featured) {
      brackhitsQB = this.repositoryService.brackhitHubRepo.getFeaturedBrackhitsQB(
        userId,
        userTime,
        take,
      );
    } else if (categoryId === BrackhitCategory.Trending) {
      brackhitsQB = this.repositoryService.brackhitHubRepo.getTrendingBrackhitsQB(
        userId,
        userTime,
        take,
      );
    } else if (categoryId === BrackhitCategory.Popular) {
      brackhitsQB = this.repositoryService.brackhitHubRepo.getPopularBrackhitsQB(
        userId,
        userTime,
        take,
      );
    } else if (categoryId === BrackhitCategory.FromArtistory) {
      brackhitsQB = this.repositoryService.brackhitHubRepo.getJustInBrackhitsQB(
        userId,
        userTime,
        params.takeAll,
        {
          take,
        },
      );
    } else if (categoryId === BrackhitCategory.ForYou) {
      return this.getForYouBrackhitsByUserAccount(userId, userTime, { take });
    } else if (categoryId === BrackhitCategory.Albums) {
      if (params.takeAll) {
        brackhitsQB = this.repositoryService.brackhitHubRepo.getAllAlbumBrackhitsQB(
          userId,
          userTime,
        );
      } else {
        brackhitsQB = this.repositoryService.brackhitHubRepo.getPreviewAlbumBrackhitsQB(
          userId,
          userTime,
          take,
        );
      }
    } else if (categoryId === BrackhitCategory.MadeByFans) {
      brackhitsQB = this.repositoryService.brackhitHubRepo.getMadeByFansBrackhitsQB(
        userId,
        userTime,
        take,
      );
    } else {
      throw new BadRequestError(ErrorConst.INVALID_HOME_CATEGORY_ID);
    }

    this.repositoryService.brackhitHubRepo.leftJoinBrackhitUserToBrackhitsQB(brackhitsQB, userId);

    const brackhits = await BrackhitsHubUtils.selectBrackhitMetaQB(brackhitsQB);

    return BrackhitsHubUtils.parseBrackhitItemPreviews(brackhits, userTime);
  }

  async getForYouBrackhitsByUserAccount(
    userId: string,
    userTime: Date,
    params: ForYouBrackhitsParamsDto = { take: Number.MAX_SAFE_INTEGER },
  ): Promise<BrackhitItemPreviewDto[]> {
    const spotifyToken = await this.usersService.getSpotifyUserToken(userId);
    let brackhits: BrackhitHubMetaDto[];

    if (spotifyToken) {
      brackhits = await this.getForYouBrackhitsBySpotifyRank(userId, userTime, params);
    } else {
      brackhits = await this.getForYouBrackhitsByUserChoice(userId, userTime, params);
    }

    const settings = await AppSettingsService.getAppSettingsState();

    if (!settings.showAlbumImages) {
      brackhits.forEach((b) => (b.thumbnail = DEFAULT_BRACKHIT_IMAGE));
    }

    return BrackhitsHubUtils.parseBrackhitItemPreviews(brackhits, userTime);
  }

  async getForYouBrackhitsBySpotifyRank(
    userId: string,
    userTime: Date,
    params: ForYouBrackhitsParamsDto,
  ): Promise<BrackhitHubMetaDto[]> {
    if (params.noneStatus) {
      return this.repositoryService.brackhitHubRepo.getForYouNoneBrackhitsBySpotifyRank(
        userId,
        userTime,
        params.take,
      );
    } else {
      return this.repositoryService.brackhitHubRepo.getForYouBrackhitsBySpotifyRank(
        userId,
        userTime,
        params.take,
      );
    }
  }

  async getForYouBrackhitsByUserChoice(
    userId: string,
    userTime: Date,
    params: ForYouBrackhitsParamsDto = { take: Number.MAX_SAFE_INTEGER },
  ): Promise<BrackhitHubMetaDto[]> {
    if (params.noneStatus) {
      return this.repositoryService.brackhitHubRepo.getForYouNoneBrackhitsByUserChoice(
        userId,
        userTime,
        params.take,
      );
    } else {
      return this.repositoryService.brackhitHubRepo.getForYouBrackhitsByUserChoice(
        userId,
        userTime,
        params.take,
      );
    }
  }

  async getBrackhitsForHomeTagCard(
    tagId: BrackhitTags,
    userId: string,
    userTime: Date,
    params: BrackhitsCardParamsDto,
  ): Promise<BrackhitItemPreviewDto[]> {
    const take = params.takeAll ? Number.MAX_SAFE_INTEGER : BRACKHIT_HOME_TAG_CARD_COUNT;

    const tagBrackhitsQB = this.repositoryService.brackhitHubRepo.getHomeTagBrackhitsQB(
      tagId,
      userId,
      userTime,
      take,
    );

    this.repositoryService.brackhitHubRepo.leftJoinBrackhitUserToBrackhitsQB(
      tagBrackhitsQB,
      userId,
    );

    const brackhits = await BrackhitsHubUtils.selectBrackhitMetaQB(tagBrackhitsQB);

    return BrackhitsHubUtils.parseBrackhitItemPreviews(brackhits, userTime);
  }

  async getHomeCategoryCardFull(
    categoryId: BrackhitCategory,
    userId: string,
    userTime: Date,
  ): Promise<BrackhitCardDto[]> {
    if (!BRACKHIT_HOME_CATEGORIES.includes(categoryId)) {
      throw new BadRequestError(ErrorConst.INVALID_HOME_CATEGORY_ID);
    }

    const category = await this.getCategoryCardById(categoryId);

    await this.joinBrackhitsToHomeCategoryCard(category, userId, userTime, {
      takeAll: true,
    });

    return [category];
  }

  async getHomeTagCardFull(
    tagId: BrackhitTags,
    userId: string,
    userTime: Date,
  ): Promise<BrackhitCardDto[]> {
    if (!BRACKHIT_HOME_TAGS.includes(tagId)) {
      throw new BadRequestError(ErrorConst.INVALID_HOME_TAG_ID);
    }

    const tag = await this.getTagCardById(tagId);

    await this.joinBrackhitsToHomeTagCard(tag, userId, userTime, {
      takeAll: true,
    });

    return [tag];
  }

  async getHubCategoryCardFull(
    categoryId: BrackhitCategory,
    hubId: BrackhitHubs,
    userId: string,
    userTime: Date,
  ): Promise<BrackhitCardDto[]> {
    if (BrackhitSpecialHubs.includes(hubId)) {
      if (!BRACKHIT_SPECIAL_HUB_CATEGORIES.includes(categoryId)) {
        throw new BadRequestException(ErrorConst.INVALID_HUB_CATEGORY_ID);
      }
    } else {
      if (!BRACKHIT_HUB_CATEGORIES.includes(categoryId)) {
        throw new BadRequestException(ErrorConst.INVALID_HUB_CATEGORY_ID);
      }
    }

    const category = await this.getCategoryCardById(categoryId);

    await this.joinBrackhitsToHubCategoryCard(category, hubId, userId, userTime, {
      takeAll: true,
    });

    return [category];
  }

  async getHubTagCardFull(
    tagId: BrackhitTags,
    hubId: BrackhitHubs,
    userId: string,
    userTime: Date,
  ): Promise<BrackhitCardDto[]> {
    if (!BRACKHIT_HUB_TAG_MAP.get(hubId)?.includes(tagId)) {
      throw new BadRequestError(ErrorConst.INVALID_HUB_TAG_ID);
    }

    const tag = await this.getTagCardById(tagId);

    await this.joinBrackhitsToHubTagCard(tag, hubId, userId, userTime, {
      takeAll: true,
    });

    return [tag];
  }

  async getBrackhitsForHubCategoryCard(
    categoryId: BrackhitCategory,
    hubId: BrackhitHubs,
    userTime: Date,
    userId: string,
    params: BrackhitsCardParamsDto,
  ): Promise<BrackhitItemPreviewDto[]> {
    const take = params.takeAll
      ? BrackhitsHubUtils.getCategoryCardFullBrackhitsCount(categoryId)
      : BrackhitsHubUtils.getHubCategoryPreviewBrackhitsCount(categoryId);

    let categoryBrackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>;
    const hubBrackhitsQB = this.repositoryService.brackhitHubRepo.getHubBrackhitsQB(hubId);

    if (categoryId === BrackhitCategory.Featured) {
      categoryBrackhitsQB = this.repositoryService.brackhitHubRepo.filterFeaturedBrackhitsQB(
        hubBrackhitsQB,
        userId,
        userTime,
        take,
      );
    } else if (categoryId === BrackhitCategory.Trending) {
      categoryBrackhitsQB = this.repositoryService.brackhitHubRepo.filterTrendingBrackhitsQB(
        hubBrackhitsQB,
        userId,
        userTime,
        take,
      );
    } else if (categoryId === BrackhitCategory.Popular) {
      categoryBrackhitsQB = this.repositoryService.brackhitHubRepo.filterPopularBrackhitsQB(
        hubBrackhitsQB,
        userId,
        userTime,
        take,
      );
    } else if (categoryId === BrackhitCategory.FromArtistory) {
      categoryBrackhitsQB = this.repositoryService.brackhitHubRepo.filterJustInBrackhitsQB(
        hubBrackhitsQB,
        hubId,
        userId,
        userTime,
        params.takeAll,
        take,
      );
    } else if (categoryId === BrackhitCategory.ForYou) {
      const forYouBrackhits = await this.getForYouBrackhitsByUserAccount(userId, userTime);

      categoryBrackhitsQB = this.repositoryService.brackhitHubRepo.filterForYouBrackhits(
        hubBrackhitsQB,
        forYouBrackhits,
        userId,
        userTime,
        take,
      );
    } else if (categoryId === BrackhitCategory.Albums) {
      if (params.takeAll) {
        categoryBrackhitsQB = this.repositoryService.brackhitHubRepo.filterAllAlbumBrackhitsQB(
          hubBrackhitsQB,
          userId,
          userTime,
        );
      } else {
        categoryBrackhitsQB = this.repositoryService.brackhitHubRepo.filterPreviewAlbumBrackhitsQB(
          hubBrackhitsQB,
          userId,
          userTime,
          take,
        );
      }
    } else if (categoryId === BrackhitCategory.MadeByFans) {
      categoryBrackhitsQB = this.repositoryService.brackhitHubRepo.filterMadeByFansBrackhitsQB(
        hubBrackhitsQB,
        userId,
        userTime,
        take,
      );
    } else if (BrackhitGenreCategories.includes(categoryId)) {
      const genreId = BRACKHIT_CATEGORY_GENRES_MAP.get(categoryId);
      categoryBrackhitsQB = this.repositoryService.brackhitHubRepo.filterGenreBrackhitsQB(
        hubBrackhitsQB,
        genreId,
        userId,
        userTime,
        { skip: 0, take },
      );
    } else {
      throw new BadRequestError(ErrorConst.INVALID_HUB_CATEGORY_ID);
    }

    this.repositoryService.brackhitHubRepo.leftJoinBrackhitUserToBrackhitsQB(
      categoryBrackhitsQB,
      userId,
    );

    const brackhits = await BrackhitsHubUtils.selectBrackhitMetaQB(categoryBrackhitsQB);

    return BrackhitsHubUtils.parseBrackhitItemPreviews(brackhits, userTime);
  }

  async getBrackhitsForHubTagCard(
    tagId: BrackhitTags,
    hubId: BrackhitHubs,
    userId: string,
    userTime: Date,
    params: BrackhitsCardParamsDto,
  ): Promise<BrackhitItemPreviewDto[]> {
    const take = params.takeAll ? Number.MAX_SAFE_INTEGER : BRACKHIT_HUB_TAG_CARD_COUNT;

    const hubBrackhitsQB = this.repositoryService.brackhitHubRepo.getHubBrackhitsQB(hubId);

    const tagBrackhitsQB = this.repositoryService.brackhitHubRepo.filterTagBrackhitsQB(
      hubBrackhitsQB,
      hubId,
      tagId,
      userId,
      userTime,
      { skip: 0, take },
    );

    const brackhits = await BrackhitsHubUtils.selectBrackhitMetaQB(tagBrackhitsQB);

    return BrackhitsHubUtils.parseBrackhitItemPreviews(brackhits, userTime);
  }

  async getBrackhitHubsAll(): Promise<BrackhitHubsCardDto> {
    const hubs = await this.repositoryService.brackhitHubRepo
      .getBrackhitHubsQBFull(HUB_CARDS_ORDER)
      .select('hubId as id', 'hub as name')
      .castTo<BrackhitHubItemDto[]>();

    return {
      name: 'Hubs',
      hubs,
    };
  }
}
