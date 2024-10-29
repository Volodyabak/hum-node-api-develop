import { Model } from 'objection';

export class BrackhitAnswerKeyModel extends Model {
  id: number;
  userId: string;
  brackhitId: number;
  campaignId: number;
  createdAt: Date;
  updatedAt: Date;

  static get tableName() {
    return 'labl.brackhit_answer_key';
  }

  static get idColumn() {
    return 'id';
  }
}
