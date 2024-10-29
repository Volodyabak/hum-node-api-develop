import { Model } from 'objection';

export class ArtistSpotifyTracksModel extends Model {
  static get tableName() {
    return 'ean_collection.artist_spotify_tracks';
  }

  static get idColumn() {
    return ['artistId', 'rank'];
  }

  static get relationMappings() {
    return {};
  }
}
