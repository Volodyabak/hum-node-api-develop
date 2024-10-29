import { Injectable } from '@nestjs/common';
import { RepositoryService } from '../../repository/services/repository.service';
import {
  GetArtistHomePreviewResponseDto,
  GetArtistHomeQueryDto,
} from '../dto/api-dto/artist-home.api-dto';
import { ArtistHomeParser } from '../parsers/artist-home.parser';
import { ArtistCategoriesModel, ArtistModel } from '../../../../database/Models';
import { JoinOperation, PaginatedItems } from '../../../Tools/dto/util-classes';
import { ArtistCategoryDataDto, ArtistCategoryDto } from '../dto/artist-home.dto';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import { expr } from '../../../../database/relations/relation-builder';
import { Relations } from '../../../../database/relations/relations';
import { RawSql } from '../../../Tools/utils/raw-sql';
import {
  ARTIST_CATEGORIES_WITH_GENRE,
  ArtistCategoryIds,
  ArtistCategorySortingIds,
  ArtistCategoryTypes,
} from '../constants/artist-home.constants';
import { QueryBuilder } from 'objection';
import { ArtistHomeUtils } from '../utils/artist-home.utils';
import { BadRequestError } from '../../../Errors';
import { ErrorConst } from '../../../constants';
import { ArtistCategoryParams } from '../interfaces/artist-home.interfaces';

@Injectable()
export class ArtistHomeService {
  constructor(private readonly repoService: RepositoryService) {}

  async getArtistHomePreviewResponse(
    userId: string,
    query: GetArtistHomeQueryDto,
  ): Promise<GetArtistHomePreviewResponseDto> {
    const home = await this.repoService.artistHomeRepo.getArtistHome();
    const categoriesData = await this.getArtistCategories(home.categoryIds, query);

    await Promise.all(
      categoriesData.items.map((category) =>
        this.getHomeCategoryData(userId, category, query).then((data) => (category.data = data)),
      ),
    );

    return {
      skip: categoriesData.skip,
      take: categoriesData.take,
      total: categoriesData.total,
      genreId: query.genreId,
      items: categoriesData.items
        .filter((el) => el.data !== undefined)
        .map((el) => ArtistHomeParser.parseCategoryCard(el)),
    };
  }

  async getArtistHomeCategoryFull(
    userId: string,
    query: GetArtistHomeQueryDto,
  ): Promise<ArtistCategoryDto> {
    const category = await this.repoService.artistHomeRepo.getArtistCategoryById(query.categoryId);

    if (!category) {
      throw new BadRequestError(ErrorConst.INVALID_HOME_CATEGORY_ID);
    }

    category.data = await this.getHomeCategoryData(userId, category, query);

    return ArtistHomeParser.parseCategoryCard(category);
  }

  async getArtistCategories(
    categoryIds: string,
    query: GetArtistHomeQueryDto,
  ): Promise<PaginatedItems<ArtistCategoriesModel>> {
    const categoriesQB = this.repoService.artistHomeRepo.getArtistCategories(categoryIds);
    const totalQB = categoriesQB.clone().resultSize();

    categoriesQB.orderByRaw(RawSql.orderByFieldId('ac', categoryIds));

    QueryBuilderUtils.addPaginationToBuilder(categoriesQB, query);

    const [categories, total] = await Promise.all([categoriesQB, totalQB]);

    return {
      skip: query.skip,
      take: query.take,
      total: total,
      items: categories,
    };
  }

  async getHomeCategoryData(
    userId: string,
    category: ArtistCategoriesModel,
    query: GetArtistHomeQueryDto,
  ): Promise<ArtistCategoryDataDto> {
    const params = ArtistHomeUtils.getArtistCategoryParams(category, query);

    if (category.type === ArtistCategoryTypes.Category) {
      return this.getCategoryCardData(userId, category, params);
    } else if (category.type === ArtistCategoryTypes.ArtistCategory) {
      return this.getArtistCategoryCardData(userId, category, params);
    } else {
      return undefined;
    }
  }

  async applyCategoryOptionsToArtists(
    artistsQB: QueryBuilder<ArtistModel, ArtistModel[]>,
    category: ArtistCategoriesModel,
    params: ArtistCategoryParams,
  ): Promise<ArtistCategoryDataDto> {
    if (params.genreId) {
      this.filterCategoryArtistsByGenre(artistsQB, category, params);
    }

    let totalQB: Promise<number>;
    if (!params.preview) {
      totalQB = artistsQB.clone().resultSize();
    }

    this.applyCategorySortingOption(artistsQB, category);
    QueryBuilderUtils.addPaginationToBuilder(artistsQB, params);
    artistsQB.select('a.id', 'a.facebookName', 'a.imageFile');

    const [artists, total] = await Promise.all([artistsQB, totalQB]);

    return {
      skip: params.skip,
      take: params.take,
      total: params.preview ? artists.length : total,
      items: ArtistHomeParser.parseArtistItems(artists),
    };
  }

  applyCategorySortingOption(
    artistsQB: QueryBuilder<ArtistModel, ArtistModel[]>,
    category: ArtistCategoriesModel,
  ): void {
    if (category.sortingId === ArtistCategorySortingIds.BrackhitCompletions) {
      // temporary code for now, until we decide what this sorting id should do
      const appearancesQB = this.repoService.artistRepo.getArtistsTotalBrackhitAppearances();
      artistsQB
        .join(appearancesQB.as('ba'), 'ba.artistId', 'a.id')
        .orderBy('ba.appearances', 'desc')
        .orderBy('a.id', 'desc');
    } else if (category.sortingId === ArtistCategorySortingIds.DailyBuzz) {
      this.repoService.artistRepo.joinDailyScoreToArtistsQB(artistsQB, {
        from: 'a',
        to: 'ds',
        join: JoinOperation.leftJoin,
      });
      artistsQB.orderBy('ds.dailyPoints', 'desc').orderBy('a.id', 'desc');
    } else if (category.sortingId === ArtistCategorySortingIds.ArtistName) {
      artistsQB.orderBy('a.facebookName');
    } else if (category.sortingId === ArtistCategorySortingIds.Appearances) {
      const appearancesQB = this.repoService.artistRepo.getArtistsTotalBrackhitAppearances();
      artistsQB
        .join(appearancesQB.as('ba'), 'ba.artistId', 'a.id')
        .orderBy('ba.appearances', 'desc')
        .orderBy('a.id', 'desc');
    }
  }

  async getCategoryCardData(
    userId: string,
    category: ArtistCategoriesModel,
    params: ArtistCategoryParams,
  ): Promise<ArtistCategoryDataDto> {
    let artistsQB: QueryBuilder<ArtistModel, ArtistModel[]>;

    if (category.id === ArtistCategoryIds.TopArtists) {
      artistsQB = this.repoService.artistHomeRepo.getTopArtists();
    } else if (category.id === ArtistCategoryIds.BuzzingArtists) {
      artistsQB = this.repoService.artistHomeRepo.getBuzzingArtists();
    } else if (category.id === ArtistCategoryIds.YourArtists) {
      artistsQB = this.repoService.artistHomeRepo.getYourArtists(userId);
    } else if (category.id === ArtistCategoryIds.UnderTheRadar) {
      artistsQB = this.repoService.artistHomeRepo.getUnderTheRadarArtists();
    } else {
      return undefined;
    }

    return this.applyCategoryOptionsToArtists(artistsQB, category, params);
  }

  async getArtistCategoryCardData(
    userId: string,
    category: ArtistCategoriesModel,
    params: ArtistCategoryParams,
  ): Promise<ArtistCategoryDataDto> {
    const sourceIds = category.sourceId.split(',');
    const artistsQB = this.repoService.artistRepo.getArtistsByCategories(sourceIds);

    return this.applyCategoryOptionsToArtists(artistsQB, category, params);
  }

  filterCategoryArtistsByGenre(
    artistsQB: QueryBuilder<ArtistModel, ArtistModel[]>,
    category: ArtistCategoriesModel,
    params: ArtistCategoryParams,
  ) {
    if (!ARTIST_CATEGORIES_WITH_GENRE.includes(category.id)) {
      artistsQB.joinRelated(expr([Relations.ArtistGenre, 'ag']));
    }
    artistsQB.where('ag.genreId', params.genreId);
  }
}
