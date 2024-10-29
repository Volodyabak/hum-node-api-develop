import { Model } from 'objection';

import { BrackhitContentTypeModel } from '../BrackhitContentTypeModel';
import { ArtistModel } from '../Artist';
import {
  SpotifyAlbumModel,
  SpotifyAlbumTrackModel,
  SpotifyArtistModel,
  SpotifyTrackModel,
} from '../Spotify';
import { Relations } from '../../relations/relations';
import { BrackhitUserChoicesModel } from '../BrackhitUserChoicesModel';

export class BrackhitContentModel extends Model {
  choiceId: number;
  contentTypeId: number;
  contentId: number;

  contentType?: BrackhitContentTypeModel;
  artist?: ArtistModel;
  track?: SpotifyTrackModel;
  trackArtists?: SpotifyArtistModel[];

  static get tableName() {
    return 'labl.brackhit_content';
  }

  static get idColumn() {
    return 'choiceId';
  }

  static get relationMappings() {
    return {
      [Relations.ContentType]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentTypeModel,
        join: {
          from: 'labl.brackhit_content.contentTypeId',
          to: 'labl.brackhit_content_type.contentTypeId',
        },
      },

      [Relations.Artist]: {
        relation: Model.HasOneRelation,
        modelClass: ArtistModel,
        join: {
          from: 'labl.brackhit_content.contentId',
          to: 'ean_collection.artist.id',
        },
      },

      [Relations.AlbumTrack]: {
        relation: Model.HasOneRelation,
        modelClass: SpotifyAlbumTrackModel,
        join: {
          from: 'labl.brackhit_content.contentId',
          to: 'ean_collection.spotify_album_track.spotifyTrackId',
        },
      },

      [Relations.Track]: {
        relation: Model.HasOneRelation,
        modelClass: SpotifyTrackModel,
        join: {
          from: 'labl.brackhit_content.contentId',
          to: 'ean_collection.spotify_track.id',
        },
      },

      [Relations.TrackArtists]: {
        relation: Model.ManyToManyRelation,
        modelClass: SpotifyArtistModel,
        join: {
          from: 'labl.brackhit_content.contentId',
          through: {
            modelClass: SpotifyAlbumTrackModel,
            from: 'ean_collection.spotify_album_track.spotifyTrackId',
            to: 'ean_collection.spotify_album_track.spotifyArtistId',
          },
          to: 'ean_collection.spotify_artist.id',
        },
      },

      [Relations.TrackAlbums]: {
        relation: Model.ManyToManyRelation,
        modelClass: SpotifyAlbumModel,
        join: {
          from: 'labl.brackhit_content.contentId',
          through: {
            modelClass: SpotifyAlbumTrackModel,
            from: 'ean_collection.spotify_album_track.spotifyTrackId',
            to: 'ean_collection.spotify_album_track.spotifyAlbumId',
          },
          to: 'ean_collection.spotify_album.id',
        },
      },

      [Relations.Choices]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitUserChoicesModel,
        join: {
          from: 'labl.brackhit_content.choiceId',
          to: 'labl.brackhit_user_choices.choiceId',
        },
      },
    };
  }
}
