import { Model } from 'objection';

export class TransactionsRecordsModel extends Model {
  transactionId: number;
  currencyId: number;
  typeId: number;
  sourceId: number;

  static get tableName() {
    return 'labl.transactions_records';
  }

  static get idColumn() {
    return ['transactionId', 'currencyId'];
  }
}
