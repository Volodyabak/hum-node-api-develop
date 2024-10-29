import { Model } from 'objection';
import { FeedItemBaseModel } from '../FeedItemBaseModel';
import { NewsFeedItemModel } from './NewsFeedItemModel';
import { Relations } from '../../relations/relations';

export class NewsFeedModel extends FeedItemBaseModel {
  id: number;
  feedSource: string;
  feedUrl: string;
  lastRetrieved: Date;
  feedIcon: string;
  type: string;
  isActive: boolean;

  static get tableName() {
    return 'ean_collection.news_feed';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.NewsFeedItem]: {
        relation: Model.HasManyRelation,
        modelClass: NewsFeedItemModel,
        join: {
          from: 'ean_collection.news_feed.id',
          to: 'ean_collection.news_feed_item.newsFeedId',
        },
      },
    };
  }
}
