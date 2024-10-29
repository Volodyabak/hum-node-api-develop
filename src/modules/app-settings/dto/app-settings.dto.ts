import { ApiProperty } from '@nestjs/swagger';
import { SettingStates, SettingTypes } from '../constants';
import { IsOptional } from 'class-validator';

export class AppSettingsQueryDto {
  @ApiProperty({ enum: Object.values(SettingTypes), example: SettingTypes })
  @IsOptional()
  type: SettingTypes;
}

export class AppSettingsResponseDto {
  @ApiProperty()
  message: string;
}

export class AppSettingsStateDto {
  showAlbumImages?: SettingStates;
  showTrackPreviews?: SettingStates;
}
