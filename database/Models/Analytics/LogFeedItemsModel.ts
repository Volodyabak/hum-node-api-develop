import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { MODEL_ID, TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../src/api-model-examples';

export class LogFeedItemsModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: MODEL_ID })
  items: number;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_feed_items';
  }

  static get idColumn() {
    return 'id';
  }
}
