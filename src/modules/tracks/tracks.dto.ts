import { ApiProperty } from '@nestjs/swagger';

import { DEFAULT_ALBUM_IMAGE } from '../../constants';
import { AppSettingsStateDto } from '../app-settings/dto/app-settings.dto';
import { MODEL_ID, SPOTIFY_TRACK_KEY, TRACK_PREVIEW } from '../../api-model-examples';

export class HotTakesParams {
  settings: AppSettingsStateDto;
}

export class TrackInfoDto {
  @ApiProperty({ example: MODEL_ID })
  id: number;
  @ApiProperty()
  trackName: string;
  @ApiProperty()
  artists: string;
  @ApiProperty({ example: SPOTIFY_TRACK_KEY })
  trackKey: string;
  @ApiProperty({ required: false })
  albumName?: string;
  @ApiProperty({ example: DEFAULT_ALBUM_IMAGE })
  albumImage: string;
  @ApiProperty({ example: TRACK_PREVIEW })
  preview: string;
}

export class TrackInfoWithAlbumNameDto extends TrackInfoDto {
  albumName: string;
}
