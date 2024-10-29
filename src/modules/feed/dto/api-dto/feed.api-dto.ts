import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

import { DateQueryDto } from '../../../../Tools/dto/main-api.dto';
import { GET_FEED_TAKE_DEFAULT } from '../../constants/feed.constants';

export class GetFeedQueryDto extends DateQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiProperty({ required: false, default: GET_FEED_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @Min(0)
  take: number = GET_FEED_TAKE_DEFAULT;
}
