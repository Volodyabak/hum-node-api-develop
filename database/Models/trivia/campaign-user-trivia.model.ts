import { Model } from 'objection';

export class CampaignUserTriviaModel extends Model {
  id: number;
  campaignId: number;
  campaignUserId: string;
  campaignTriviaId: number;
  attempts: number;
  score: number;
  createdAt: Date;
  updatedAt: Date;

  static get tableName() {
    return 'labl.campaign_user_trivia';
  }

  static get idColumn() {
    return 'id';
  }
}
