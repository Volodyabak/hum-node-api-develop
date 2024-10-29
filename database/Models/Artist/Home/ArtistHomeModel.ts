import { Model } from 'objection';

export class ArtistHomeModel extends Model {
  id: number;
  name: string;
  categoryIds: string;

  static get tableName() {
    return 'labl.artist_home';
  }

  static get idColumn() {
    return ['id'];
  }

  static getTableNameWithAlias(alias: string = 'ah'): string {
    return ArtistHomeModel.tableName.concat(' as ', alias);
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
