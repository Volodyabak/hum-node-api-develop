import { Model } from 'objection';

export class TransactionsCoinModel extends Model {
  id: number;
  userId: string;
  value: number;
  timestamp: Date;

  static get tableName() {
    return 'labl.transactions_coin';
  }

  static get idColumn() {
    return 'id';
  }
}
