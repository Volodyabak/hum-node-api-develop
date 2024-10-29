import { Model } from 'objection';

export class CampaignTriviaUserChoiceModel extends Model {
  id: number;
  campaignUserTriviaId: number;
  roundId: number;
  choiceId: number;
  createdAt: Date;
  updatedAt: Date;

  static get tableName() {
    return 'labl.campaign_trivia_user_choice';
  }

  static get idColumn() {
    return 'id';
  }
}
