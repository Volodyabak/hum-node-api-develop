import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../src/api-model-examples';

export class LogSpotifySigninSkipModel extends Model {
  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_spotify_signin_skip';
  }

  static get idColumn() {
    return 'userId';
  }
}
