import { Model } from 'objection';

export class TransactionsXPModel extends Model {
  id: number;
  userId: string;
  value: number;
  timestamp: Date;

  static get tableName() {
    return 'labl.transactions_xp';
  }

  static get idColumn() {
    return 'id';
  }
}
