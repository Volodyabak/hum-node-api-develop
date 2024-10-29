import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

import { ArtistModel } from './ArtistModel';
import { FeedItemBaseModel } from '../FeedItemBaseModel';
import { Relations } from '../../relations/relations';
import { NewsFeedModel } from './NewsFeedModel';

export class NewsFeedItemModel extends FeedItemBaseModel {
  @ApiProperty()
  feedType: number;
  @ApiProperty()
  newsItemId: number;
  @ApiProperty()
  newsFeedId: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  link: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  newsImage: string;
  @ApiProperty()
  artistId: number;
  @ApiProperty()
  artistName: string;
  @ApiProperty()
  artistImage: string;

  image: string;
  detail: string;

  static get tableName() {
    return 'ean_collection.news_feed_item';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      artist: {
        relation: Model.ManyToManyRelation,
        modelClass: ArtistModel,
        join: {
          from: 'ean_collection.news_feed_item.id',
          through: {
            from: 'ean_collection.artist_news_item.newsFeedItemId',
            to: 'ean_collection.artist_news_item.artistId',
          },
          to: 'ean_collection.artist.id',
        },
      },

      [Relations.NewsFeed]: {
        relation: Model.HasOneRelation,
        modelClass: NewsFeedModel,
        join: {
          from: 'ean_collection.news_feed_item.newsFeedId',
          to: 'ean_collection.news_feed.id',
        },
      },
    };
  }

  async $afterFind() {
    this.description = this.detail;
  }

  async $beforeInsert() {
    if (this.description) {
      this.detail = this.description;
    }
    this.description = undefined;
  }

  async $beforeUpdate() {
    if (this.description) {
      this.detail = this.description;
    }
    this.description = undefined;
  }
}
