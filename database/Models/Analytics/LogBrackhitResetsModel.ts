import { Model } from 'objection';

export class LogBrackhitResetsModel extends Model {
  id: number;
  brackhitId: number;
  userId: string;
  timestamp: Date;

  static get tableName() {
    return 'labl.log_brackhit_resets';
  }

  static get idColumn() {
    return 'id';
  }
}
