import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { MODEL_ID, TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../src/api-model-examples';

export class LogBrackhitDownloadModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: MODEL_ID })
  brackhitId: number;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_brackhit_download';
  }

  static get idColumn() {
    return 'id';
  }
}
