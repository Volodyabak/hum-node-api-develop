import { BrackhitContentType, BrackhitSize } from '../constants/brackhits.constants';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsString,
  Min,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { BRACKHIT_SORTING } from '@database/Models/BrackhitModel';
import { Type } from 'class-transformer';
import { BrackhitContentExtraData } from '../../brackhits-content/dto/input/brackhit-content.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrackhitInput {
  @ApiProperty({ enum: Object.values(BrackhitContentType) })
  @IsEnum(BrackhitContentType)
  type: BrackhitContentType;
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  @IsDate()
  timeLive: Date;
  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  duration: number;
  @ApiProperty()
  @IsString()
  thumbnail: string;
  @ApiProperty({ enum: Object.values(BrackhitSize).filter((el) => !isNaN(+el)) })
  @IsEnum(BrackhitSize)
  size: BrackhitSize;
  @ApiProperty({ enum: Object.values(BRACKHIT_SORTING) })
  @IsEnum(BRACKHIT_SORTING)
  sort: BRACKHIT_SORTING = BRACKHIT_SORTING.DEFAULT;
  // content: Array<BrackhitTrack | BrackhitArtist | BrackhitAlbum | YoutubeVideo>;
  @ApiProperty()
  @Type(() => BrackhitContentInput)
  content: (BrackhitContentInput | BrackhitCustomContentInput)[];
}

export class BrackhitContentInput {
  @ApiProperty()
  @IsNotEmpty()
  id: number | string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  seed: number;

  @ApiProperty({ required: false })
  data: BrackhitContentExtraData;
}

export class BrackhitCustomContentInput {
  name: string;
  thumbnail: string;
  contentUrl: string;
  sourceTypeId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  seed: number;
}
