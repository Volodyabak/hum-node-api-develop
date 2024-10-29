import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

import { SpotifyArtistModel } from './SpotifyArtistModel';
import { SpotifyTrackModel } from './SpotifyTrackModel';
import { FeedItemBaseModel } from '../FeedItemBaseModel';
import { Relations } from '../../relations/relations';
import { SpotifyAlbumArtistModel } from './SpotifyAlbumArtistModel';
import { SpotifyAlbumTrackModel } from './SpotifyAlbumTrackModel';
import { FeedUtils } from '../../../src/modules/feed/utils/feed.utils';

export class SpotifyAlbumModel extends FeedItemBaseModel {
  @ApiProperty()
  id: number;
  @ApiProperty()
  albumKey: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  albumType: string;
  @ApiProperty()
  releaseDate: Date;
  @ApiProperty()
  releaseDatePrecision: string;
  @ApiProperty()
  albumImage: string;
  @ApiProperty()
  albumLabel: string;
  @ApiProperty()
  copyrights: string;
  @ApiProperty()
  genres: string;
  @ApiProperty()
  markets: string;
  @ApiProperty()
  tracks: number;
  @ApiProperty()
  dateInserted: Date;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  link?: string;
  spotifyArtists?: SpotifyArtistModel[];

  static get tableName() {
    return 'ean_collection.spotify_album';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Tracks]: {
        relation: Model.ManyToManyRelation,
        modelClass: SpotifyTrackModel,
        join: {
          from: 'ean_collection.spotify_album.id',
          through: {
            modelClass: SpotifyAlbumTrackModel,
            from: 'ean_collection.spotify_album_track.spotify_album_id',
            to: 'ean_collection.spotify_album_track.spotify_track_id',
          },
          to: 'ean_collection.spotify_track.id',
        },
      },

      [Relations.SpotifyArtists]: {
        relation: Model.ManyToManyRelation,
        modelClass: SpotifyArtistModel,
        join: {
          from: 'ean_collection.spotify_album.id',
          through: {
            modelClass: SpotifyAlbumArtistModel,
            from: 'ean_collection.spotify_album_artist.album_id',
            to: 'ean_collection.spotify_album_artist.artist_id',
          },
          to: 'ean_collection.spotify_artist.id',
        },
      },
    };
  }

  $afterFind(): Promise<any> | void {
    if (this.albumKey) {
      this.link = FeedUtils.getSpotifyAlbumShareLink(this.albumKey);
    }
  }
}
