import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../src/api-model-examples';

export class LogYoutubeVideoModel extends Model {
  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty()
  videoKey: string;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_youtube_video';
  }

  static get idColumn() {
    return ['userId', 'videoKey', 'timePlayed'];
  }
}
