import { Model } from 'objection';
import { Relations } from '@database/relations/relations';
import { SpotifyArtistModel } from '@database/Models';

export class CampaignSpotifyTopArtistsModel extends Model {
  id: number;
  campaignId: number;
  spotifyArtistId: number;
  term: string;
  score: number;

  spotifyArtist?: SpotifyArtistModel;

  static get tableName() {
    return 'labl.campaign_spotify_top_artists';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.SpotifyArtist]: {
        relation: Model.HasOneRelation,
        modelClass: SpotifyArtistModel,
        join: {
          from: `${CampaignSpotifyTopArtistsModel.tableName}.spotifyArtistId`,
          to: `${SpotifyArtistModel.tableName}.${SpotifyArtistModel.idColumn}`,
        },
      },
    };
  }
}
