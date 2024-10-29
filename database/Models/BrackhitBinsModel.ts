import { Model } from 'objection';

export class BrackhitBinsModel extends Model {
  static get tableName() {
    return 'labl.brackhit_bins';
  }

  static get idColumn() {
    return 'id';
  }
}
