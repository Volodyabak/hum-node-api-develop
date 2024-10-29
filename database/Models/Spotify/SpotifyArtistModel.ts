import { Model } from 'objection';
import { SpotifyTrackModel } from './SpotifyTrackModel';
import { SpotifyAlbumModel } from './SpotifyAlbumModel';
import { ArtistModel } from '../Artist';
import { UserFeedPreferencesModel } from '../User';
import { Relations } from '../../relations/relations';
import { SpotifyAlbumTrackModel } from './SpotifyAlbumTrackModel';
import { SpotifyRelatedArtistsModel } from './SpotifyRelatedArtistsModel';

export class SpotifyArtistModel extends Model {
  id: number;
  artistKey: string;
  artistId: number;
  artistName: string;
  dateInserted: Date;
  lastChecked: Date;

  artist?: ArtistModel;

  static get tableName() {
    return 'ean_collection.spotify_artist';
  }

  static get idColumn() {
    return 'id';
  }

  static tableNameWithAlias(alias: string): string {
    return SpotifyArtistModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      [Relations.Artist]: {
        relation: Model.HasOneRelation,
        modelClass: ArtistModel,
        join: {
          from: 'ean_collection.spotify_artist.artistId',
          to: 'ean_collection.artist.id',
        },
      },

      [Relations.Tracks]: {
        relation: Model.ManyToManyRelation,
        modelClass: SpotifyTrackModel,
        join: {
          from: 'ean_collection.spotify_artist.id',
          through: {
            from: 'ean_collection.spotify_album_track.spotify_artist_id',
            to: 'ean_collection.spotify_album_track.spotify_track_id',
          },
          to: 'ean_collection.spotify_track.id',
        },
      },

      [Relations.Albums]: {
        relation: Model.ManyToManyRelation,
        modelClass: SpotifyAlbumModel,
        join: {
          from: 'ean_collection.spotify_artist.id',
          through: {
            from: 'ean_collection.spotify_album_artist.artist_id',
            to: 'ean_collection.spotify_album_artist.album_id',
          },
          to: 'ean_collection.spotify_album.id',
        },
      },

      [Relations.UserFeed]: {
        relation: Model.HasManyRelation,
        modelClass: UserFeedPreferencesModel,
        join: {
          from: 'ean_collection.spotify_artist.artistId',
          to: 'labl.user_feed_preferences.artistId',
        },
      },

      [Relations.AlbumTrack]: {
        relation: Model.HasManyRelation,
        modelClass: SpotifyAlbumTrackModel,
        join: {
          from: 'ean_collection.spotify_artist.id',
          to: 'ean_collection.spotify_album_track.spotifyArtistId',
        },
      },

      [Relations.SpotifyRelatedArtists]: {
        relation: Model.HasManyRelation,
        modelClass: SpotifyRelatedArtistsModel,
        join: {
          from: 'ean_collection.spotify_artist.artistKey',
          to: 'ean_collection.spotify_related_artists.spotifyArtistkey',
        },
      },
    };
  }

  static get rawSql() {
    return {
      getCommaSeparatedArtistNames(alias: string, name: string) {
        return `GROUP_CONCAT(DISTINCT (${alias}.artist_name) SEPARATOR ', ') as ${name}`;
      },
    };
  }
}
