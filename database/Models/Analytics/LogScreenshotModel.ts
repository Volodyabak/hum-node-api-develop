import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, MODEL_ID, UUID_V4 } from '../../../src/api-model-examples';

export class LogScreenshotModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: MODEL_ID })
  brackhitId?: number;

  @ApiProperty()
  orientation: number;

  @ApiProperty()
  screenId: number;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  updatedAt: Date;

  static get tableName() {
    return 'labl.log_screenshot';
  }

  static get idColumn() {
    return 'id';
  }
}
