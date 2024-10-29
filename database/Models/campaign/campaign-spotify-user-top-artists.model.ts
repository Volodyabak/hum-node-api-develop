import { Model } from 'objection';

export class CampaignSpotifyUserTopArtistsModel extends Model {
  id: number;
  campaignUserId: string;
  campaignId: number;
  spotifyArtistId: number;
  period: string;
  position: number;
  createdAt: Date;

  static get tableName() {
    return 'labl.campaign_spotify_user_top_artists';
  }

  static get idColumn() {
    return 'id';
  }
}
