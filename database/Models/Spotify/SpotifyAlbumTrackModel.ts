import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { SpotifyTrackModel } from './SpotifyTrackModel';
import { SpotifyArtistModel } from './SpotifyArtistModel';
import { SpotifyAlbumModel } from './SpotifyAlbumModel';

export class SpotifyAlbumTrackModel extends Model {
  id: number;
  spotifyAlbumId: number;
  spotifyTrackId: number;
  spotifyArtistId: number;

  static get tableName() {
    return 'ean_collection.spotify_album_track';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Tracks]: {
        relation: Model.HasManyRelation,
        modelClass: SpotifyTrackModel,
        join: {
          from: 'ean_collection.spotify_album_track.spotifyTrackId',
          to: 'ean_collection.spotify_track.id',
        },
      },

      [Relations.Artists]: {
        relation: Model.HasManyRelation,
        modelClass: SpotifyArtistModel,
        join: {
          from: 'ean_collection.spotify_album_track.spotifyArtistId',
          to: 'ean_collection.spotify_artist.id',
        },
      },

      [Relations.Album]: {
        relation: Model.HasOneRelation,
        modelClass: SpotifyAlbumModel,
        join: {
          from: 'ean_collection.spotify_album_track.spotifyAlbumId',
          to: 'ean_collection.spotify_album.id',
        },
      },
    };
  }
}
