import { Model } from 'objection';

export class CampaignBallotUserChoice extends Model {
  id: number;
  campaignUserBallotId: number;
  roundId: number;
  choiceId: number;
  voteRank: number;
  createdAt: Date;
  updatedAt: Date;

  static get tableName() {
    return 'labl.campaign_ballot_user_choice';
  }

  static get idColumn() {
    return 'id';
  }
}
