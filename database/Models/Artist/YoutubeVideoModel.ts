import { Model } from 'objection';
import { ArtistModel } from './ArtistModel';
import { FeedItemBaseModel } from '../FeedItemBaseModel';
import { ApiProperty } from '@nestjs/swagger';
import { FeedUtils } from '../../../src/modules/feed/utils/feed.utils';
import { Relations } from '../../relations/relations';
import { YoutubeChannelModel } from './YoutubeChannelModel';

export class YoutubeVideoModel extends FeedItemBaseModel {
  @ApiProperty()
  id: number;
  @ApiProperty()
  youtubeKey: string;
  @ApiProperty()
  videoTitle: string;
  @ApiProperty()
  thumbnail: string;
  @ApiProperty()
  videoCreated: Date;
  @ApiProperty()
  dateInserted: Date;
  @ApiProperty()
  channelId: number;
  @ApiProperty()
  playlistId: number;
  @ApiProperty()
  isPrivate: number;

  link?: string;

  static get tableName() {
    return 'ean_collection.youtube_video';
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
          from: 'ean_collection.youtube_video.id',
          through: {
            from: 'ean_collection.youtube_artist_video.youtubeVideoId',
            to: 'ean_collection.youtube_artist_video.artistId',
          },
          to: 'ean_collection.artist.id',
        },
      },

      [Relations.Channel]: {
        relation: Model.BelongsToOneRelation,
        modelClass: YoutubeChannelModel,
        join: {
          from: `${this.tableName}.channelId`,
          to: `${YoutubeChannelModel.tableName}.channelKey`,
        },
      },
    };
  }

  $afterFind() {
    if (this.youtubeKey) {
      this.link = FeedUtils.getYoutubeVideoShareLink(this.youtubeKey);
    }
  }
}
