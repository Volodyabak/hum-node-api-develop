import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, MODEL_ID, UUID_V4 } from '../../../src/api-model-examples';

export class LogCompareModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: UUID_V4 })
  compareUserId: string;

  @ApiProperty({ example: MODEL_ID })
  brackhitId: number;

  @ApiProperty()
  compareType: number;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_compare';
  }

  static get idColumn() {
    return 'id';
  }
}
