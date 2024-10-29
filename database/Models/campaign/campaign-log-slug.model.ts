import { Model } from 'objection';

export class CampaignLogSlugModel extends Model {
  id: number;
  campaignId: number;
  userId: string;
  slugId: number;
  createdAt: Date;

  static get tableName() {
    return 'labl.campaign_log_slug';
  }

  static get idColumn() {
    return 'id';
  }
}
