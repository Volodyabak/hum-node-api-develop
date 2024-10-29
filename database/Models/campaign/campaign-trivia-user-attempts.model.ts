import { Model } from 'objection';

export class CampaignTriviaUserAttemptsModel extends Model {
  id: number;
  campaignUserTriviaId: number;
  attempt: number;
  score: number;
  createdAt: Date;

  static get tableName() {
    return 'labl.campaign_trivia_user_attempts';
  }

  static get idColumn() {
    return 'id';
  }
}
