import { db } from '../../../database/knex';
import { TransactionsRecordsModel } from '../../../database/Models/Transactions/TransactionsRecordsModel';
import { TransactionsXPModel } from '../../../database/Models/Transactions/TransactionsXPModel';
import { TransactionsCoinModel } from '../../../database/Models/Transactions/TransactionsCoinModel';
import { ConstantsModel } from '../../../database/Models/ConstantsModel';
import { ConstantId } from '../../modules/constants/constants';

const TRANSACTION_TYPES = {
  BRACKHIT: 1,
  BUZZBEAT: 2,
  ADD_ARTIST: 3,
  ADD_FRIEND: 4,
  CREATE_BRACKHIT: 5,
  SIGN_UP: 6,
};

const CURRENCY_TYPES = {
  XP: 1,
  COIN: 2,
};

class TransactionsService {
  async insertUserSignedUpAward(userId: string) {
    const constant = await ConstantsModel.query().findById(ConstantId.USER_SIGN_UP_AWARD);
    return insertXpTransaction(userId, TRANSACTION_TYPES.SIGN_UP, null, constant.value);
  }

  async insertBuzzbeatCompletedAward(userId: string, gameId: number) {
    const constant = await ConstantsModel.query().findById(ConstantId.BUZZBEAT_COMPLETED_XP);
    return insertXpTransaction(userId, TRANSACTION_TYPES.BUZZBEAT, gameId, constant.value);
  }

  async insertBrackhitCompletedAward(brackhitId: number, userId: string) {
    const constant = await ConstantsModel.query().findById(ConstantId.BRACKHIT_COMPLETED_XP);
    return insertXpTransaction(userId, TRANSACTION_TYPES.BRACKHIT, brackhitId, constant.value);
  }

  async getUserBrackhitCompletionXp(source_id, user_id) {
    const type_id = TRANSACTION_TYPES.BRACKHIT;

    return db({ tx: 'labl.transactions_xp' })
      .select({
        userId: 'user_id',
        xp: 'value',
        timestamp: 'timestamp',
      })
      .join({ tr: 'labl.transactions_records' }, 'tr.transaction_id', 'tx.id')
      .where({
        source_id,
        user_id,
        type_id,
      });
  }
}

/***
 * ---------------------------------------------------------------------------------------------------------------
 * Private fundamental transaction functions that shouldn't be used outside this module.
 * Create public class method instead which calls insertCoinOperation() or insertXpTransaction()
 * to perform specific transaction. This way all transaction logic and xp/coin constant values
 * will be stored inside this module and may be easily refactored or extended in the future
 * ---------------------------------------------------------------------------------------------------------------
 */

const insertCoinTransaction = async (userId: string, typeId, sourceId, value) => {
  const result = await TransactionsCoinModel.query().insertAndFetch({ userId, value });
  return insertTransactionRecord(result.id, CURRENCY_TYPES.COIN, typeId, sourceId);
};

const insertXpTransaction = async (userId: string, typeId, sourceId, value) => {
  const result = await TransactionsXPModel.query().insertAndFetch({ userId, value });
  return insertTransactionRecord(result.id, CURRENCY_TYPES.XP, typeId, sourceId);
};

const insertTransactionRecord = async (transactionId, currencyId, typeId, sourceId) => {
  return TransactionsRecordsModel.query().insert({
    transactionId,
    currencyId,
    typeId,
    sourceId,
  });
};

const instance = new TransactionsService();
export { instance as TransactionsService };
