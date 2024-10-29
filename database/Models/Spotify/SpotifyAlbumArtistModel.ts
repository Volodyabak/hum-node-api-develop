import { Model } from 'objection';

export class SpotifyAlbumArtistModel extends Model {
  albumId: number;
  artistId: number;

  static get tableName() {
    return 'ean_collection.spotify_album_artist';
  }

  static get idColumn() {
    return ['albumId', 'artistId'];
  }
}
