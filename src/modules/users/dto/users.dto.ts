import { ApiProperty } from '@nestjs/swagger';
import {
  SPOTIFY_ARTIST_KEY,
  SPOTIFY_TRACK_KEY,
  TIMESTAMP_EXAMPLE,
  TRACK_ALBUM_IMAGE,
  TRACK_PREVIEW,
  USER_IMAGE,
  UUID_V4,
} from '../../../api-model-examples';
import { DEFAULT_BRACKHIT_IMAGE } from '../../../constants';

export class UserArtistDto {
  @ApiProperty()
  artistId: number;
  @ApiProperty()
  artistName: string;
  @ApiProperty()
  artistPhoto: string;
  @ApiProperty()
  genreName: string;
  @ApiProperty()
  isFollowing: 0 | 1;
}

export class GetUserBrackhitsParams {
  completed: 0 | 1;
  skip: number;
  take: number;
}

export class TopTrackArtistDto {
  @ApiProperty()
  name: string;
}

export class TopTrackAlbumDto {
  @ApiProperty()
  image: string;
}

export class UserTopTrackDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ example: SPOTIFY_TRACK_KEY })
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: TRACK_PREVIEW })
  preview: string;

  @ApiProperty({ type: TopTrackAlbumDto })
  album: TopTrackAlbumDto;

  @ApiProperty({ type: [TopTrackArtistDto] })
  artists: TopTrackArtistDto[];

  @ApiProperty()
  userValue: number;
}

export class UserTopArtistDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  userValue: number;
}

export class UserTopStatsDto {
  @ApiProperty({ type: UserTopTrackDto })
  track: UserTopTrackDto;

  @ApiProperty({ type: UserTopArtistDto })
  artist: UserTopArtistDto;
}

export class UserBrackhitDto {
  @ApiProperty()
  brackhitId: number;

  @ApiProperty()
  brackhitName: string;

  @ApiProperty()
  brackhitImage: string;

  @ApiProperty()
  isComplete: boolean;
}

export class UserCreatedBrackhitPreviewDto {
  @ApiProperty()
  brackhitId: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: DEFAULT_BRACKHIT_IMAGE })
  thumbnail: string;
}

export class UserCreatedBrackhitDto {
  @ApiProperty()
  brackhitId: number;

  @ApiProperty()
  brackhitName: string;

  @ApiProperty()
  brackhitImage: string;

  @ApiProperty()
  isComplete: boolean;

  @ApiProperty()
  completions: number;
}

export class FriendTopArtistDto {
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
  rank: number;
}

export class UserTopCategoryDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  genre_name: string;
}

export class FriendTopTrackDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  trackName: string;

  @ApiProperty()
  artists: string;

  @ApiProperty({ example: SPOTIFY_TRACK_KEY })
  trackKey: string;

  @ApiProperty({ example: TRACK_ALBUM_IMAGE })
  albumImage: string;

  @ApiProperty({ example: TRACK_PREVIEW })
  preview: string;

  @ApiProperty()
  ranking: number;
}

export class DiscoveredTrackDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  trackName: string;

  @ApiProperty()
  artists: string;

  @ApiProperty({ example: SPOTIFY_TRACK_KEY })
  trackKey: string;

  @ApiProperty({ example: TRACK_ALBUM_IMAGE })
  albumImage: string;

  @ApiProperty({ example: TRACK_PREVIEW })
  preview: string;

  @ApiProperty()
  rank: number;
}

export class UserGenreDto {
  @ApiProperty()
  genre_name: string;

  @ApiProperty()
  p: number;
}

export class UserProfileDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  userHometown: string;

  @ApiProperty()
  userBio: string;

  @ApiProperty({ example: USER_IMAGE })
  userImage: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  createdAt: Date;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  updatedAt: Date;

  @ApiProperty()
  profileComplete: boolean;
}

export class FullUserProfileDto extends UserProfileDto {
  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  joinDate: Date;

  @ApiProperty()
  followedArtistsCount: number;

  @ApiProperty()
  friendsCount: number;
}
