import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../src/api-model-examples';

export class LogSpotifyTrackModel extends Model {
  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty()
  trackKey: string;

  @ApiProperty()
  trackPreview: number;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;

  @ApiProperty()
  brackhitId: number;

  @ApiProperty()
  roundId: number;

  static get tableName() {
    return 'labl.log_spotify_track';
  }

  static get idColumn() {
    return ['userId', 'trackKey', 'timePlayed'];
  }
}
