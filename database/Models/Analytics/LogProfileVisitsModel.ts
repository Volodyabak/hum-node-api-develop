import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, MODEL_ID, UUID_V4 } from '../../../src/api-model-examples';

export class LogProfileVisitsModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: UUID_V4 })
  userViewed: string;

  @ApiProperty({ example: MODEL_ID })
  screenId: number;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_profile_visits';
  }

  static get idColumn() {
    return 'id';
  }
}
