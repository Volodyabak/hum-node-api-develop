import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { SpotifyArtistModel } from './SpotifyArtistModel';

export class SpotifyRelatedArtistsModel extends Model {
  spotifyArtistkey: string;
  relatedArtistkey: string;
  position: number;

  static get tableName() {
    return 'ean_collection.spotify_related_artists';
  }

  static get idColumn() {
    return ['spotifyArtistkey', 'relatedArtistkey'];
  }

  static get relationMappings() {
    return {
      [Relations.SpotifyArtist]: {
        relation: Model.HasManyRelation,
        modelClass: SpotifyArtistModel,
        join: {
          from: 'ean_collection.spotify_related_artists.spotifyArtistkey',
          to: 'ean_collection.spotify_artist.artistKey',
        },
      },

      [Relations.RelatedSpotifyArtist]: {
        relation: Model.HasManyRelation,
        modelClass: SpotifyArtistModel,
        join: {
          from: 'ean_collection.spotify_related_artists.relatedArtistkey',
          to: 'ean_collection.spotify_artist.artistKey',
        },
      },
    };
  }
}
