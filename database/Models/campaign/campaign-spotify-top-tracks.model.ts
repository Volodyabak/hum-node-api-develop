import { Model } from 'objection';
import { Relations } from '@database/relations/relations';
import { SpotifyTrackModel } from '@database/Models';

export class CampaignSpotifyTopTracksModel extends Model {
  id: number;
  campaignId: number;
  spotifyTrackId: number;
  term: string;
  score: number;

  track?: SpotifyTrackModel;

  static get tableName() {
    return 'labl.campaign_spotify_top_tracks';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Track]: {
        relation: Model.HasOneRelation,
        modelClass: SpotifyTrackModel,
        join: {
          from: `${CampaignSpotifyTopTracksModel.tableName}.spotifyTrackId`,
          to: `${SpotifyTrackModel.tableName}.id`,
        },
      },
    };
  }
}
