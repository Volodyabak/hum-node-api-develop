import { Model } from 'objection';

export class BrackhitAdsModel extends Model {
  brackhitId: number;
  position: number;

  static get tableName() {
    return 'labl.brackhit_ads';
  }

  static get idColumn() {
    return 'brackhitId';
  }
}
