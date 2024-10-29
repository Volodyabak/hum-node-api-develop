import { Model } from 'objection';

import { SpotifyAlbumModel } from './SpotifyAlbumModel';
import { SpotifyArtistModel } from './SpotifyArtistModel';
import { ApiProperty } from '@nestjs/swagger';
import { BrackhitContentModel } from '../Brackhit/BrackhitContentModel';
import { SPOTIFY_TRACK_KEY } from '../../../src/api-model-examples';
import { Relations } from '../../relations/relations';
import { AppleTrackModel } from './AppleTrackModel';
import { ArtistSpotifyTracksModel } from './ArtistSpotifyTracksModel';

export class SpotifyTrackModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty({ example: SPOTIFY_TRACK_KEY })
  trackKey: string;
  @ApiProperty()
  trackName: string;
  @ApiProperty()
  trackDisc: number;
  @ApiProperty()
  trackNumber: number;
  @ApiProperty()
  explicit: number;
  @ApiProperty()
  popularity: number;
  @ApiProperty()
  trackUri: string;
  @ApiProperty()
  trackPreview: string;
  @ApiProperty()
  isrc: string;
  @ApiProperty()
  isrcId: number;
  @ApiProperty()
  lastChecked: Date;

  trackId: number;
  choiceId: number;
  preview: string;
  appleTrack: AppleTrackModel;
  appleTrackPreview: string;
  albumImage: string;
  album: SpotifyAlbumModel;
  artists: SpotifyArtistModel[];
  rank: number;

  static get tableName() {
    return 'ean_collection.spotify_track';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.ArtistTracks]: {
        relation: Model.HasManyRelation,
        modelClass: ArtistSpotifyTracksModel,
        join: {
          from: 'ean_collection.artist_spotify_tracks.trackKey',
          to: 'ean_collection.spotify_track.trackKey',
        },
      },

      [Relations.Artists]: {
        relation: Model.ManyToManyRelation,
        modelClass: SpotifyArtistModel,
        join: {
          from: 'ean_collection.spotify_track.id',
          through: {
            from: 'ean_collection.spotify_album_track.spotify_track_id',
            to: 'ean_collection.spotify_album_track.spotify_artist_id',
          },
          to: 'ean_collection.spotify_artist.id',
        },
      },

      [Relations.Album]: {
        relation: Model.HasOneThroughRelation,
        modelClass: SpotifyAlbumModel,
        join: {
          from: 'ean_collection.spotify_track.id',
          through: {
            from: 'ean_collection.spotify_album_track.spotify_track_id',
            to: 'ean_collection.spotify_album_track.spotify_album_id',
          },
          to: 'ean_collection.spotify_album.id',
        },
      },

      [Relations.Content]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: 'ean_collection.spotify_track.id',
          to: 'labl.brackhit_content.contentId',
        },
      },

      [Relations.AppleTrack]: {
        relation: Model.BelongsToOneRelation,
        modelClass: AppleTrackModel,
        join: {
          from: 'ean_collection.spotify_track.isrc',
          to: 'ean_collection.apple_track.isrc',
        },
      },
    };
  }

  static get rawSql() {
    return {
      getTrackPreview(stAlias: string, atAlias: string, name: string) {
        return `coalesce(\`${stAlias}\`.track_preview, \`${atAlias}\`.track_preview) as ${name}`;
      },
    };
  }
}
