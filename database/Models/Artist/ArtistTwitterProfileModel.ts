import { Model } from 'objection';

export class ArtistTwitterProfileModel extends Model {
  static get tableName() {
    return 'ean_collection.artist_twitter_profile';
  }

  static get idColumn() {
    return 'artistId';
  }
}
