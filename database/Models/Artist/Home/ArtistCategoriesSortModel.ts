import { Model } from 'objection';
import { ArtistCategorySortingIds } from '../../../../src/modules/artists/constants/artist-home.constants';

export class ArtistCategoriesSortModel extends Model {
  id: ArtistCategorySortingIds;
  type: string;

  static get tableName() {
    return 'labl.artist_categories_sort';
  }

  static get idColumn() {
    return ['id'];
  }

  static getTableNameWithAlias(alias: string = 'acs'): string {
    return ArtistCategoriesSortModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {};
  }

  static get rawSql() {
    return {};
  }

  static get callbacks() {
    return {};
  }
}
