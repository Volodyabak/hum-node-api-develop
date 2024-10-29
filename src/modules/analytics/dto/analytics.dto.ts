import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

import { MODEL_ID, SPOTIFY_TRACK_KEY, UUID_V4 } from '../../../api-model-examples';
import { PLAYLIST_KEY } from '../../spotify/constants';
import { PlaylistSource } from '../constants';

export class UserIdDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
}

export class LogArtistViewBodyDto {
  @ApiProperty({ example: MODEL_ID })
  @IsNotEmpty()
  artistId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  screenId: number = null;
}

export class LogChallengeBodyDto {
  @ApiProperty({ example: MODEL_ID })
  @IsNotEmpty()
  challengeId: number;
}

export class CreateBrackhitBtnBodyDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  screenId: number;
}

export class MyBrackhitBodyDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  brackhitId: number;
}

export class BrackhitPreviewBodyDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  brackhitId: number;
}

export class BrackhitUserHomeBodyDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  screenId: number;
}

export class FeedScrollBodyDto {
  @ApiProperty()
  @IsDefined()
  @IsInt()
  items: number;
}

export class BrackhitCreationBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: PLAYLIST_KEY })
  @IsNotEmpty()
  playlistKey: string;
  @ApiProperty({ required: false, example: PlaylistSource.INTERNAL })
  @IsOptional()
  @IsEnum(PlaylistSource)
  playlistSource: PlaylistSource;
}

export class LogSpotifyTrackDto {
  @ApiProperty({ example: SPOTIFY_TRACK_KEY })
  @IsNotEmpty()
  trackKey: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  preview: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  brackhitId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(15)
  roundId: number;
}

export class LogYoutubeVideoDto {
  @ApiProperty()
  @IsNotEmpty()
  videoKey: string;
}

export class LogProfileViewDto {
  @ApiProperty({ example: UUID_V4 })
  @IsNotEmpty()
  viewedUserKey: string;

  @ApiProperty({ required: false, example: MODEL_ID })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  screenId?: number;
}

export class LogBottomNavigationDto {
  @ApiProperty()
  @IsNotEmpty()
  itemType: number;

  @ApiProperty()
  app_open: number;
}

export class LogBrackhitVisitDto {
  @ApiProperty({ example: MODEL_ID })
  @IsNotEmpty()
  brackhitId: number;

  @ApiProperty()
  screenId: number;

  @ApiProperty()
  hubId: number;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  tagId: number;
}

export class LogUpdateAppDto {
  @ApiProperty()
  version?: string;
}

export class LogShareBrackhitDto {
  @ApiProperty({ example: MODEL_ID })
  brackhitId?: number;
}

export class LogScreenshotDto {
  @ApiProperty()
  @IsNotEmpty()
  screenId: number;

  @ApiProperty()
  @IsNotEmpty()
  orientation: number;

  @ApiProperty({ example: MODEL_ID })
  brackhitId?: number;
}

export class LogBrackhitCompareDto {
  @ApiProperty({ example: MODEL_ID })
  brackhitId: number;

  @ApiProperty({ example: UUID_V4 })
  @IsNotEmpty()
  compareUserId: string;

  @ApiProperty()
  @IsNotEmpty()
  compareType: number;
}

export class LogBrackhitHubsDto {
  @ApiProperty({ example: MODEL_ID })
  @IsNotEmpty()
  hubId: number;
}

export class LogNewsArticleDto {
  @ApiProperty({ example: MODEL_ID })
  @IsNotEmpty()
  newsitemId: number;
}

export class UpdateNewsArticleLogBodyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  closedAt: Date;
}

export class LogContentBodyDto {
  @ApiProperty()
  @IsInt()
  centralId: number;
  @ApiProperty()
  @IsInt()
  interactionId: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  screenId: number;
}

export class UpdateContentLogBodyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  timeEnd: Date;
}
