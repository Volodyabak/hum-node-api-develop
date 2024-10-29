import { Model } from 'objection';

export class BrackhitDailyModel extends Model {
  id: number;
  brackhitId: number;
  date: Date;

  static get tableName() {
    return 'labl.brackhit_daily';
  }

  static get idColumn() {
    return 'id';
  }

  static get rawSql() {
    return {
      selectDailyBrackhitCompletion() {
        return ``;
      },
    };
  }
}
