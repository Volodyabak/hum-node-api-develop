import { Model } from 'objection';
import { TwitterMediaModel } from './TwitterMediaModel';
import { ArtistModel } from './ArtistModel';
import { FeedItemBaseModel } from '../FeedItemBaseModel';
import { ApiProperty } from '@nestjs/swagger';

export class TwitterPostModel extends FeedItemBaseModel {
  @ApiProperty()
  feedType: number;
  @ApiProperty()
  postId: number;
  @ApiProperty()
  postKey: number;
  @ApiProperty()
  text: string;
  @ApiProperty()
  twitterProfileName: string;
  @ApiProperty()
  twitterProfileImage: string;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  artistId: number;
  @ApiProperty()
  artistName: string;
  @ApiProperty()
  artistImage: string;
  @ApiProperty()
  tweetMedia: TwitterMediaModel;

  static get tableName() {
    return 'ean_collection.twitter_post';
  }

  static get idColumn() {
    return 'postId';
  }

  static get relationMappings() {
    return {
      artist: {
        relation: Model.ManyToManyRelation,
        modelClass: ArtistModel,
        join: {
          from: 'ean_collection.twitter_post.postId',
          through: {
            from: 'ean_collection.twitter_artist_post.postId',
            to: 'ean_collection.twitter_artist_post.artistId',
          },
          to: 'ean_collection.artist.id',
        },
      },

      tweetMedia: {
        relation: Model.HasManyRelation,
        modelClass: TwitterMediaModel,
        join: {
          from: 'ean_collection.twitter_post.postId',
          to: 'ean_collection.twitter_media.postId',
        },
      },
    };
  }
}
