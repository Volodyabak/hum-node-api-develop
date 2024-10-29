import { Model } from 'objection';

export class CampaignsSpotifyUserTokensModel extends Model {
  userId: string;
  refreshToken: string;
  accessToken: string;
  spotifyUserId: string;
  expireTime: number;
  accountType: string;
  lastUpdated: Date;
  dateInserted: Date;
  lasChecked: Date;

  static get tableName() {
    return 'labl.campaign_spotify_user_tokens';
  }

  static get idColumn() {
    return 'userId';
  }
}
