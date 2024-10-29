import { Injectable } from '@nestjs/common';
import { TransactionsXPModel } from '../../../../database/Models/Transactions/TransactionsXPModel';
import { TransactionsRecordsModel } from '../../../../database/Models/Transactions/TransactionsRecordsModel';
import { CURRENCY_TYPES, TRANSACTION_TYPES } from '../constants';
import { Transaction } from 'objection';

@Injectable()
export class TransactionService {
  // async insertEndedBrackhitResultsAward(
  //   brackhitId: number,
  //   userId: string,
  //   score: number,
  //   trx?: Transaction,
  // ) {
  //   const xpTransaction = await TransactionsXPModel.query(trx).insertAndFetch({
  //     userId,
  //     value: Math.round(score / 2),
  //   });
  //   await TransactionsRecordsModel.query(trx).insert({
  //     transactionId: xpTransaction.id,
  //     currencyId: CURRENCY_TYPES.XP,
  //     typeId: TRANSACTION_TYPES.BRACKHIT,
  //     sourceId: brackhitId,
  //   });
  // }
}
