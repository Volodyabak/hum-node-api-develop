import { ArtistCategoryDto } from '../artist-home.dto';
import { GET_ARTIST_HOME_TAKE_DEFAULT } from '../../constants/artist-home.constants';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetArtistHomeQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_ARTIST_HOME_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @Min(1)
  take: number = GET_ARTIST_HOME_TAKE_DEFAULT;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  categoryId: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  genreId: number = null;
}

export class GetArtistHomePreviewResponseDto {
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty()
  genreId: number;
  @ApiProperty({ type: [ArtistCategoryDto] })
  items: ArtistCategoryDto[];
}
