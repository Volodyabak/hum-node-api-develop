import { ArtistCategoriesModel } from '../../../../database/Models';
import { GetArtistHomeQueryDto } from '../dto/api-dto/artist-home.api-dto';
import { ArtistCategoryParams } from '../interfaces/artist-home.interfaces';

export class ArtistHomeUtils {
  static getArtistCategoryParams(
    category: ArtistCategoriesModel,
    query: GetArtistHomeQueryDto,
  ): ArtistCategoryParams {
    const preview = query.categoryId === undefined;

    return {
      preview,
      skip: preview ? 0 : query.skip,
      take: preview ? category.previewCount : query.take,
      genreId: query.genreId,
    };
  }
}
