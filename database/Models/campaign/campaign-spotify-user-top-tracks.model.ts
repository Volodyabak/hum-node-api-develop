import { Model } from 'objection';

export class CampaignSpotifyUserTopTracksModel extends Model {
  id: number;
  campaignUserId: string;
  campaignId: number;
  spotifyTrackId: number;
  period: string;
  position: number;
  createdAt: Date;

  static get tableName() {
    return 'labl.campaign_spotify_user_top_tracks';
  }

  static get idColumn() {
    return 'id';
  }
}
