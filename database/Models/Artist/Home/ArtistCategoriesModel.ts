import { Model } from 'objection';
import {
  ArtistCategoryIds,
  ArtistCategorySortingIds,
  ArtistCategoryTypes,
} from '../../../../src/modules/artists/constants/artist-home.constants';
import { ArtistCategoryDataDto } from '../../../../src/modules/artists/dto/artist-home.dto';
import { Relations } from '../../../relations/relations';
import { ArtistCategoriesSortModel } from './ArtistCategoriesSortModel';

export class ArtistCategoriesModel extends Model {
  id: ArtistCategoryIds;
  categoryName: string;
  type: ArtistCategoryTypes;
  cardType: number;
  sourceId: string;
  previewCount: number;
  sortingId: ArtistCategorySortingIds;
  sortingType: string;

  data?: ArtistCategoryDataDto;

  static get tableName() {
    return 'labl.artist_categories';
  }

  static get idColumn() {
    return ['id'];
  }

  static getTableNameWithAlias(alias: string = 'ac'): string {
    return ArtistCategoriesModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      [Relations.Sort]: {
        relation: Model.HasOneRelation,
        modelClass: ArtistCategoriesSortModel,
        join: {
          from: 'labl.artist_categories.sortingId',
          to: 'labl.artist_categories_sort.id',
        },
      },
    };
  }

  static get rawSql() {
    return {};
  }

  static get callbacks() {
    return {};
  }
}
