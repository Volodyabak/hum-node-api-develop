import { Model } from 'objection';

export class SpotifyArtistUserModel extends Model {
  userId;
  spotifyArtistId;

  static get tableName() {
    return 'labl.user_spotify_artist';
  }

  static get idColumn() {
    return ['userId', 'spotifyArtistId'];
  }
}
