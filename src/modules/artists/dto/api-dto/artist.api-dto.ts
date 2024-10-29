import { IsIn, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { DATE_EXAMPLE, SPOTIFY_ARTIST_KEY, UUID_V4 } from '../../../../api-model-examples';
import {
  GET_ARTIST_BLURBS_TAKE_DEFAULT,
  GET_ARTIST_FEED_TAKE_DEFAULT,
  GET_ARTIST_TRACKS_TAKE_DEFAULT,
  GET_ARTISTS_TAKE_DEFAULT,
  SEARCH_ARTISTS_TAKE_DEFAULT,
} from '../../constants/artist-constants';
import { DatePaginationQueryDto, DateQueryDto } from '../../../../Tools/dto/main-api.dto';
import {
  ArtistDefaultDto,
  ArtistDto,
  ArtistProfileDto,
  ArtistReleaseBlurbDto,
  ArtistTrackDto,
  SearchedArtistDto,
} from '../artists.dto';
import { ArtistFeedModel } from 'database/Models';
import { ApiProperty } from '@nestjs/swagger';

export class GetArtistBlurbsQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_ARTIST_BLURBS_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @Min(0)
  take: number = GET_ARTIST_BLURBS_TAKE_DEFAULT;
}

export class GetArtistDefaultQueryDto extends DatePaginationQueryDto {}

export class GetArtistDefaultResponseDto {
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [ArtistDefaultDto] })
  artists: ArtistDefaultDto[];
}

export class GetArtistTracksResponseDto {
  @ApiProperty()
  artistId: number;
  @ApiProperty({ example: SPOTIFY_ARTIST_KEY })
  artistKey: string;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [ArtistTrackDto] })
  tracks: ArtistTrackDto[];
}

export class GetArtistTracksQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_ARTIST_TRACKS_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @Min(0)
  take: number = GET_ARTIST_TRACKS_TAKE_DEFAULT;
}

export class SearchArtistQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  query: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  genreId: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  category: number;
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsIn([0, 1])
  following: 0 | 1 = 0;
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: SEARCH_ARTISTS_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @Min(0)
  take: number = SEARCH_ARTISTS_TAKE_DEFAULT;
}

export class GetArtistCategoryResponseDto {
  @ApiProperty()
  artistId: number;
  @ApiProperty()
  categoryId: number;
  @ApiProperty()
  category: string;
}

export class GetArtistBlurbsResponseDto {
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: ArtistReleaseBlurbDto })
  releases: ArtistReleaseBlurbDto[];
}

export class SearchArtistResponseDto {
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  count: number;
  @ApiProperty({ type: [ArtistProfileDto] })
  artists: ArtistProfileDto[] | SearchedArtistDto[];
}

export class GetArtistsResponseDto {
  @ApiProperty()
  count: number;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty({ type: [ArtistDto] })
  artists: ArtistDto[];
}

export class GetArtistsQueryDto extends DateQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiProperty({ required: false, default: GET_ARTISTS_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @Min(0)
  take: number = GET_ARTISTS_TAKE_DEFAULT;
}

export class GetArtistFeedQueryDto extends DateQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiProperty({ required: false, default: GET_ARTIST_FEED_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @Min(0)
  take: number = GET_ARTIST_FEED_TAKE_DEFAULT;
}

export class GetArtistFeedResponseDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty({ example: DATE_EXAMPLE })
  date: Date;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({
    isArray: true,
    type: [ArtistFeedModel],
  })
  feed: ArtistFeedModel[];
}
