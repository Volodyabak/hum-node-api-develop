import { Model } from 'objection';

export class CampaignUserLinkModel extends Model {
  id: number;
  campaignId: number;
  userId: string;

  static get tableName() {
    return 'labl.campaign_user_link';
  }

  static get idColumn() {
    return 'id';
  }
}
