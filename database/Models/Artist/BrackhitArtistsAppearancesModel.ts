import { Model } from 'objection';

export class BrackhitArtistsAppearancesModel extends Model {
  brackhitId: number;
  artistId: number;
  appearances: number;

  static get tableName() {
    return 'labl.brackhit_artists_appearances';
  }

  static get idColumn() {
    return ['brackhitId', 'artistId'];
  }

  static getTableNameWithAlias(alias: string): string {
    return BrackhitArtistsAppearancesModel.tableName.concat(' as ', alias);
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
