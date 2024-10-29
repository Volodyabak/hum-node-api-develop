import { Model } from 'objection';

export class CampaignSpotifyScopesModel extends Model {
  campaignId: number;
  scopes: string;

  static get tableName() {
    return 'labl.campaign_spotify_scopes';
  }

  static get idColumn() {
    return 'campaignId';
  }
}
