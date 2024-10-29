import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BrackhitContentType } from '../../../modules/brackhits/constants/brackhits.constants';

export class DataDto {
  @ApiProperty({ description: 'Video ID (required for youtube_clip type)' })
  @IsNotEmpty({ message: 'videoId is required for youtube_clip type' })
  @IsString()
  videoId: string;
}

export class ChoiceDto {
  @ApiProperty({ enum: BrackhitContentType, description: 'Type of content' })
  @IsEnum(BrackhitContentType)
  type: BrackhitContentType;

  @ApiPropertyOptional({ description: 'ID of the content (required for non-custom types)' })
  @ValidateIf((o) => o.type !== BrackhitContentType.Custom)
  @IsNotEmpty({ message: 'id is required for non-custom types' })
  id?: number | string;

  @ApiPropertyOptional({ description: 'Name of the custom choice (required for custom type)' })
  @ValidateIf((o) => o.type === BrackhitContentType.Custom)
  @IsNotEmpty({ message: 'name is required for custom type' })
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Content URL for custom choices' })
  @ValidateIf((o) => o.type === BrackhitContentType.Custom)
  @IsOptional()
  @IsString()
  contentUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL for custom choices' })
  @ValidateIf((o) => o.type === BrackhitContentType.Custom)
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({ description: 'Video data (required for video types)' })
  @ValidateIf((o) => o.type === BrackhitContentType.YoutubeClip)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DataDto)
  data?: DataDto;

  @ApiPropertyOptional({ description: 'Is choice correct' })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
