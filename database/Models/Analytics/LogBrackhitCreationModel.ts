import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { DATE_EXAMPLE, MODEL_ID, UUID_V4 } from '../../../src/api-model-examples';
import { PlaylistSource } from '../../../src/modules/analytics/constants';
import { PLAYLIST_KEY } from '../../../src/modules/spotify/constants';

export class LogBrackhitCreationModel extends Model {
  @ApiProperty({ example: MODEL_ID })
  id: number;
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: PLAYLIST_KEY })
  playlistKey: string;
  @ApiProperty({ example: PlaylistSource.EXTERNAL })
  playlistSource: PlaylistSource;
  @ApiProperty({ example: DATE_EXAMPLE })
  timestamp: Date;

  static get tableName() {
    return 'labl.log_brackhit_creation';
  }

  static get idColumn() {
    return 'id';
  }
}
