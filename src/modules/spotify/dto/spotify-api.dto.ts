import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

import {
  PLAYLIST_IMAGE,
  PLAYLIST_KEY,
  SPOTIFY_PLAYLIST_LINK,
  SpotifyPlaylistSort,
} from '../constants';
import { PlaylistDto, PlaylistTrackDto, SpotifyTrackDto } from './spotify.dto';

export class GetPlaylistQueryDto {
  @ApiProperty()
  @IsUrl()
  link: string;
}

export class GetPlaylistResponseDto {
  @ApiProperty({ example: PLAYLIST_KEY })
  playlistKey: string;
  @ApiProperty()
  playlistName: string;
  @ApiProperty({ example: PLAYLIST_IMAGE })
  playlistImage: string;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [SpotifyTrackDto] })
  tracks: SpotifyTrackDto[];
}

export class PostPlaylistBodyDto {
  @ApiProperty({ required: false, example: SPOTIFY_PLAYLIST_LINK })
  link?: string;
  @ApiProperty()
  playlist?: GetPlaylistResponseDto;
}

export class PostPlaylistQueryDto {
  @ApiProperty({ enum: Object.values(SpotifyPlaylistSort), example: SpotifyPlaylistSort.HEAD })
  @IsEnum(SpotifyPlaylistSort)
  sort: SpotifyPlaylistSort;
}

export class PostPlaylistResponseDto {
  @ApiProperty({ type: PlaylistDto })
  playlist: PlaylistDto;
  @ApiProperty({ type: [PlaylistTrackDto] })
  tracks: PlaylistTrackDto[];
}

export class GetSpotifyAuthorizeQueryDto {
  @ApiProperty()
  @IsNotEmpty()
  redirectUri: string;

  @ApiProperty()
  scope: string;
}

export class PostCodeExchangeDto {
  @ApiProperty()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsOptional()
  redirectUri?: string;

  @ApiProperty()
  @IsOptional()
  saveTokens?: boolean;

  @ApiProperty()
  @IsOptional()
  campaignId?: number;
}

export class SpotifyCodeExchangeResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  tokenType: string;

  @ApiProperty()
  scope: string;
}
