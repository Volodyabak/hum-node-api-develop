import { Model } from 'objection';
import { BrackhitModel } from './BrackhitModel';
import { ArtistModel } from './Artist';
import { Relations } from '../relations/relations';
import { UserFeedPreferencesModel } from './User';
import { BrackhitUserModel } from './BrackhitUserModel';

export class BrackhitArtistModel extends Model {
  static get tableName() {
    return 'labl.brackhit_artists';
  }

  static get idColumn() {
    return ['brackhitId', 'artistId'];
  }

  static get relationMappings() {
    return {
      [Relations.Brackhit]: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.brackhit_artists.brackhitId',
          to: 'labl.brackhit.brackhitId',
        },
      },

      [Relations.Artist]: {
        relation: Model.HasOneRelation,
        modelClass: ArtistModel,
        join: {
          from: 'labl.brackhit_artists.artistId',
          to: 'ean_collection.artist.id',
        },
      },

      [Relations.UserFeed]: {
        relation: Model.HasManyRelation,
        modelClass: UserFeedPreferencesModel,
        join: {
          from: 'labl.brackhit_artists.artistId',
          to: 'labl.user_feed_preferences.artistId',
        },
      },

      [Relations.BrackhitUser]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitUserModel,
        join: {
          from: 'labl.brackhit_artists.brackhitId',
          to: 'labl.brackhit_user.brackhitId',
        },
      },
    };
  }
}
