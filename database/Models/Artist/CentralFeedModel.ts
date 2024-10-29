import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { FeedSourceModel } from './FeedSourceModel';
import { ArtistModel } from './ArtistModel';
import { NewsFeedItemModel } from './NewsFeedItemModel';
import { FeedSources } from '../../../src/modules/feed/constants/feed.constants';

export class CentralFeedModel extends Model {
  id: number;
  feedSource: FeedSources;
  sourceId: number;

  sourceFeed?: FeedSourceModel;

  static get tableName() {
    return 'ean_collection.central_feed';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.FeedSource]: {
        relation: Model.HasOneRelation,
        modelClass: FeedSourceModel,
        join: {
          from: 'ean_collection.central_feed.feedSource',
          to: 'ean_collection.feed_source.id',
        },
      },

      [Relations.Artist]: {
        relation: Model.HasOneRelation,
        modelClass: ArtistModel,
        join: {
          from: 'ean_collection.central_feed.artistId',
          to: 'ean_collection.artist.id',
        },
      },

      [Relations.NewsFeedItem]: {
        relation: Model.HasOneRelation,
        modelClass: NewsFeedItemModel,
        join: {
          from: 'ean_collection.central_feed.sourceId',
          to: 'ean_collection.news_feed_item.id',
        },
      },
    };
  }
}
