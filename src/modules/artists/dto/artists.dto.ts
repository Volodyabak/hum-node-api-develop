import { ApiProperty } from '@nestjs/swagger';
import {
  DATE_EXAMPLE,
  MODEL_ID,
  NO_PROFILE_ARTIST_IMAGE,
  SPOTIFY_ALBUM_KEY,
  SPOTIFY_ARTIST_KEY,
  SPOTIFY_TRACK_KEY,
  TRACK_ALBUM_IMAGE,
  TRACK_PREVIEW,
} from '../../../api-model-examples';

export class ArtistReleaseBlurbDto {
  @ApiProperty({ example: SPOTIFY_ALBUM_KEY })
  contentId: string;
  @ApiProperty({ example: DATE_EXAMPLE })
  timeStamp: Date;
  @ApiProperty({ example: TRACK_ALBUM_IMAGE })
  image: string;
  @ApiProperty()
  blurb: string;
  @ApiProperty()
  contentType: number;
  @ApiProperty()
  total: number;
}

export class ArtistDefaultDto {
  @ApiProperty({ example: MODEL_ID })
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  image: string;
  @ApiProperty()
  followCount: number;
}

export class ArtistTrackDto {
  @ApiProperty({ example: SPOTIFY_TRACK_KEY })
  trackKey: string;
  @ApiProperty()
  trackName: string;
  @ApiProperty({ example: TRACK_PREVIEW })
  preview: string;
  @ApiProperty({ example: TRACK_ALBUM_IMAGE })
  albumImage: string;
}

export class ArtistBuzzDto {
  @ApiProperty()
  artistId: number;
  @ApiProperty()
  buzzPoints: number;
  @ApiProperty()
  date: Date;
}

export class SearchedArtistDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: NO_PROFILE_ARTIST_IMAGE })
  photo: string;
  @ApiProperty()
  buzzPoints: number;
  @ApiProperty()
  isFollowed: boolean;
}

export class ArtistProfileDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  photo: string;
  @ApiProperty({ example: SPOTIFY_ARTIST_KEY })
  spotifyId: string;
  @ApiProperty()
  buzzPoints: number;
  @ApiProperty()
  rankChange: -1 | 0 | 1;
  @ApiProperty()
  genreName: string;
  @ApiProperty()
  category: string;
  @ApiProperty()
  isFollowed: boolean;
}

export class ArtistDto {
  @ApiProperty()
  artistId: number;
  @ApiProperty()
  artistName: string;
  @ApiProperty({ example: NO_PROFILE_ARTIST_IMAGE })
  artistPhoto: string;
  @ApiProperty({ example: SPOTIFY_ARTIST_KEY })
  spotifyId: string;
  @ApiProperty()
  buzzPoints: number;
  @ApiProperty()
  rankChange: -1 | 0 | 1;
  @ApiProperty()
  genreName: string;
  @ApiProperty()
  category: string;
  @ApiProperty()
  newBlurbs: 0 | 1;
  @ApiProperty({ type: Boolean })
  isFollowed: 0 | 1 | boolean;
}
