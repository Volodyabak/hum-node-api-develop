import { BrackhitCategoriesModel } from '../../../../database/Models';
import { BrackhitItemDto, BrackhitMetaDto, CategoryCardDto } from '../dto/brackhits-home.dto';
import { BrackhitsUtils } from './brackhits.utils';
import { CategoryParams, GetHomeBrackhitsQueryBase } from '../interfaces/brackhits-home.interface';

export class BrackhitHomeUtils {
  static getCategoryParams(
    category: BrackhitCategoriesModel,
    query: GetHomeBrackhitsQueryBase,
  ): CategoryParams {
    const preview = query.categoryId === undefined;

    return {
      preview,
      skip: preview ? 0 : query.skip,
      take: preview ? category.previewCount : query.take,
    };
  }

  static parseBrackhitItems(brackhits: BrackhitMetaDto[], userTime: Date): BrackhitItemDto[] {
    return brackhits.map((b) => ({
      brackhitId: b.brackhitId,
      name: b.name,
      thumbnail: b.thumbnail,
      isLive: BrackhitsUtils.isLiveBrackhit(b, userTime),
      userStatus: BrackhitsUtils.identifyUserBrackhitStatus(b),
    }));
  }

  static parseCategoryCards(categories: BrackhitCategoriesModel[]): CategoryCardDto[] {
    return categories
      .filter((c) => c.data !== undefined)
      .map((c) => ({
        id: c.id,
        name: c.categoryName,
        type: c.type,
        cardType: c.cardType,
        ...c.data,
      }));
  }

  static isCategoryArtistLimitEnabled(category: BrackhitCategoriesModel, params: CategoryParams) {
    return params.preview && category.artistLimitSortId && category.artistLimit;
  }
}
