import { DATE_EXAMPLE } from '../../api-model-examples';
import { IsDate, IsInt, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';
import { DEFAULT_TAKE } from '../../constants';
import { PaginationParams } from './util-classes';
import { ApiProperty } from '@nestjs/swagger';

export class UidParamDto {
  id: string;
}

export class PaginationResponseDto {
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
}

export class PaginationQueryDto implements PaginationParams {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  @IsInt()
  skip: number = 0;

  @ApiProperty({
    required: false,
    default: DEFAULT_TAKE,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  take: number = DEFAULT_TAKE;
}

export class DatePaginationQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false, example: DATE_EXAMPLE })
  @IsOptional()
  @IsDate()
  date: Date = new Date();
}

export class IdParamDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  id: number;
}

export class UserBrackhitIdsParamDto {
  @ApiProperty()
  @IsUUID(4)
  userId: string;
  @ApiProperty()
  @IsInt()
  brackhitId: number;
}

export class BrackhitIdUserIdParamDto {
  @ApiProperty()
  @IsUUID(4)
  userId: string;

  @ApiProperty()
  @IsInt()
  brackhitId: number;
}

export class UserIdParamDto {
  @ApiProperty()
  @IsUUID(4)
  userId: string;
}

export class BrackhitIdParamDto {
  @ApiProperty()
  @IsInt()
  brackhitId: number;
}

export class TagIdParamDto {
  @ApiProperty()
  @IsInt()
  tagId: number;
}

export class ArtistIdParamDto {
  @ApiProperty()
  @IsInt()
  artistId: number;
}

export class HubIdTagIdParamsDto {
  @ApiProperty()
  @IsInt()
  hubId: number;

  @ApiProperty()
  @IsInt()
  tagId: number;
}

export class CentralIdParamDto {
  @ApiProperty()
  @IsInt()
  centralId: number;
}

export class DateQueryDto {
  @ApiProperty({ required: false, example: DATE_EXAMPLE })
  @IsOptional()
  @IsDate()
  date: Date = new Date();
}
