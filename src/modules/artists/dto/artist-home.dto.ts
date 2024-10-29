import { ApiProperty } from '@nestjs/swagger';
import { ArtistCategoryIds, ArtistCategoryTypes } from '../constants/artist-home.constants';

export class ArtistItemDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  image: string;
  @ApiProperty()
  genreId: number;
}

export class ArtistCategoryDataDto {
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [ArtistItemDto] })
  items: ArtistItemDto[];
}

export class ArtistCategoryDto {
  @ApiProperty()
  id: ArtistCategoryIds;
  @ApiProperty()
  name: string;
  @ApiProperty()
  type: ArtistCategoryTypes;
  @ApiProperty()
  cardType: number;
  @ApiProperty({ type: ArtistCategoryDataDto })
  data: ArtistCategoryDataDto;
}
