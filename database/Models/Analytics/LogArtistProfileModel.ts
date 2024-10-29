import { Model } from 'objection';
import { MODEL_ID, TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../src/api-model-examples';
import { ApiProperty } from '@nestjs/swagger';

export class LogArtistProfileModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: MODEL_ID })
  artistId: number;

  @ApiProperty({ example: MODEL_ID })
  screenId: number;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_artist_profile';
  }

  static get idColumn() {
    return 'id';
  }
}
