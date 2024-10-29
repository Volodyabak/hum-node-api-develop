import { Model } from 'objection';

export enum CustomContentMediaType {
  Track = 'track',
  Video = 'video',
  Album = 'album',
  Artist = 'artist',
}

export class CampaignCustomContentNameModel extends Model {
  id: number;
  campaignId: number;
  choiceId: number;
  primaryName: string;
  secondaryName: string;
  detail: string;
  additionalMedia: string;
  mediaType: CustomContentMediaType;

  static get tableName() {
    return 'labl.campaign_custom_content_name';
  }

  static get idColumn() {
    return 'id';
  }
}
