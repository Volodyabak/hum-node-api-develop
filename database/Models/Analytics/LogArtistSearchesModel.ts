import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, FIRST_NAME, MODEL_ID, UUID_V4 } from '../../../src/api-model-examples';

export class LogArtistSearchesModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: FIRST_NAME })
  query: string;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_artist_searches';
  }

  static get idColumn() {
    return 'id';
  }
}
