import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, MODEL_ID, UUID_V4 } from '../../../src/api-model-examples';

export class LogBrackhitVisitsModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: MODEL_ID })
  brackhitId: number;

  @ApiProperty()
  screenId: number;

  @ApiProperty()
  hubId: number;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  tagId: number;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_brackhit_visits';
  }

  static get idColumn() {
    return 'id';
  }
}
