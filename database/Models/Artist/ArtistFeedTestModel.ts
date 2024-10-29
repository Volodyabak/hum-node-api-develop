import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { ArtistModel } from './ArtistModel';
import { DateUtils } from '../../../src/Tools/utils/date-utils';
import { CentralFeedModel } from './CentralFeedModel';
import { FeedTypes } from '../../../src/modules/feed/constants/feed.constants';
import { UserFeedPreferencesModel } from '../User';

export class ArtistFeedTestModel extends Model {
  id: number;
  feedSource: number;
  feedType: number;
  sourceId: number;
  centralId: number;
  artistId: number;
  artistName: string;
  artistImage: string;
  timestamp: Date;

  artist: ArtistModel;
  static get tableName() {
    return 'ean_collection.artist_feed_test';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.CentralFeed]: {
        relation: Model.HasOneRelation,
        modelClass: CentralFeedModel,
        join: {
          from: 'ean_collection.artist_feed_test.centralId',
          to: 'ean_collection.central_feed.id',
        },
      },

      [Relations.Artist]: {
        relation: Model.HasOneRelation,
        modelClass: ArtistModel,
        join: {
          from: 'ean_collection.artist_feed_test.artistId',
          to: 'ean_collection.artist.id',
        },
      },

      [Relations.UserFeed]: {
        relation: Model.HasOneRelation,
        modelClass: UserFeedPreferencesModel,
        join: {
          from: 'ean_collection.artist_feed_test.artistId',
          to: 'labl.user_feed_preferences.artistId',
        },
      },
    };
  }

  static get rawSql() {
    return {
      getFeedItemTimestamp(date: Date, alias: string): string {
        const seconds = DateUtils.timeToSeconds(date);

        return `IF(feed_type = ${FeedTypes.SpotifyAlbum},
        ADDTIME(${alias}.timestamp, SEC_TO_TIME(RAND() * ${seconds})),
        ${alias}.timestamp) as timestamp`;
      },
    };
  }
}
