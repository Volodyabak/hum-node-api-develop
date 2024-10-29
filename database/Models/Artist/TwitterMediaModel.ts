import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

export class TwitterMediaModel extends Model {
  @ApiProperty()
  postId: number;
  @ApiProperty()
  media: string;
  @ApiProperty()
  mediaTypeId: number;

  static get tableName() {
    return 'ean_collection.twitter_media';
  }

  static get idColumn() {
    return ['postId', 'rank'];
  }
}
