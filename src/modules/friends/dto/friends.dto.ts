import {
  SPOTIFY_ARTIST_KEY,
  SPOTIFY_TRACK_KEY,
  TRACK_ALBUM_IMAGE,
  TRACK_PREVIEW,
  UUID_V4,
} from '../../../api-model-examples';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsUUID, Min, MinLength } from 'class-validator';
import { UserFriendBrackhitDto } from '../../brackhits/dto/brackhits.dto';
import { FRIENDS_COMPATIBILITY_BRACKHITS_TAKE, UserRelationship } from '../constants';
import { ArtistProfileDto } from '../../artists/dto/artists.dto';
import {
  DiscoveredTrackDto,
  FriendTopArtistDto,
  FriendTopTrackDto,
  FullUserProfileDto,
  UserGenreDto,
} from '../../users/dto/users.dto';
import { BadgesModel } from '../../../../database/Models';
import { FRIEND_SEARCH_QUERY_MIN_LENGTH } from '../../notifications/constants/notification.constants';
import { ApiProperty } from '@nestjs/swagger';

export class GetFriendsCompatibilityQueryDto {
  @ApiProperty({
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  skipBrackhits: number = 0;
  @ApiProperty({
    default: FRIENDS_COMPATIBILITY_BRACKHITS_TAKE,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  takeBrackhits: number = FRIENDS_COMPATIBILITY_BRACKHITS_TAKE;
}

export class UserFriendProfileResponseDto {
  @ApiProperty({ type: FullUserProfileDto })
  profile: FullUserProfileDto;

  @ApiProperty({ type: [BadgesModel] })
  badges: BadgesModel[];

  @ApiProperty({ type: [UserGenreDto] })
  musicProfile: UserGenreDto[];

  @ApiProperty({ type: [FriendTopArtistDto] })
  artists: FriendTopArtistDto[];

  @ApiProperty({ type: [FriendTopTrackDto] })
  tracks: FriendTopTrackDto[];
}

export class PostFriendRequestBodyDto {
  @ApiProperty({ example: UUID_V4 })
  @IsUUID(4)
  userRequestedId: string;
}

export class PostFriendRespondBodyDto {
  @ApiProperty({ example: UUID_V4 })
  @IsUUID(4)
  userRequestedId: string;

  @ApiProperty()
  @IsOptional()
  accept: boolean;
}

export class SearchUsersQueryDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(FRIEND_SEARCH_QUERY_MIN_LENGTH)
  query: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @IsPositive()
  take: number = 20;
}

export class SearchedUserDto {
  @ApiProperty({ example: UUID_V4 })
  @IsUUID(4)
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  userHometown: string;

  @ApiProperty()
  userBio: string;

  @ApiProperty()
  userImage: string;

  @ApiProperty()
  influencerType: number;

  @ApiProperty()
  username: string;

  @ApiProperty({ example: UserRelationship.FRIEND })
  relationship: UserRelationship;
}

export class SearchUsersResponseDto {
  @ApiProperty()
  skip: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  count: number;

  @ApiProperty({ isArray: true, type: SearchedUserDto })
  users: SearchedUserDto[];
}

export class FriendsParamsDto {
  @ApiProperty({ example: UUID_V4 })
  @IsUUID(4)
  friendId: string;
}

export class FriendComparedGenreDto {
  @ApiProperty()
  genreId: number;

  @ApiProperty()
  genreName: string;

  @ApiProperty()
  userRank: number;

  @ApiProperty()
  friendRank: number;
}

export class BadgeDto {
  @ApiProperty()
  badgeId: number;

  @ApiProperty()
  badge: string;
}

export class ComparedBadgesDto {
  @ApiProperty({ type: [BadgeDto] })
  shared: BadgeDto[];

  @ApiProperty({ type: [BadgeDto] })
  user: BadgeDto[];

  @ApiProperty({ type: [BadgeDto] })
  friend: BadgeDto[];
}

export class UserFriendSharedArtistDto {
  @ApiProperty()
  artistId: number;

  @ApiProperty()
  userRank: number;

  @ApiProperty()
  friendRank: number;
}

export class UserFriendSharedTrackDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userRank: number;

  @ApiProperty()
  friendRank: number;
}

export class UserFriendDiscoveredTrackDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  rank: number;
}

export class UserFriendSharedTrackResponseDto {
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
  userRank: number;

  @ApiProperty()
  friendRank: number;
}

export class DiscoveredFriendCategory {
  @ApiProperty()
  genreId: number;

  @ApiProperty()
  genreName: string;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  category: string;

  @ApiProperty()
  p1: number;
}

export class UserFriendSharedArtistsResponseDto {
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
  userRank: number;

  @ApiProperty()
  friendRank: number;
}

export class FriendCompatibilityResponseDto {
  @ApiProperty({ type: ComparedBadgesDto })
  badges: ComparedBadgesDto;

  @ApiProperty({ type: [FriendComparedGenreDto] })
  genres: FriendComparedGenreDto[];

  @ApiProperty({ type: [UserFriendSharedTrackResponseDto] })
  tracks: UserFriendSharedTrackResponseDto[];

  @ApiProperty({ type: [UserFriendSharedArtistsResponseDto] })
  artists: UserFriendSharedArtistsResponseDto[];

  @ApiProperty()
  skipBrackhits: number;

  @ApiProperty()
  takeBrackhits: number;

  @ApiProperty()
  totalBrackhits: number;

  @ApiProperty({ type: [UserFriendBrackhitDto] })
  brackhits: UserFriendBrackhitDto[];
}

export class DiscoverFriendArtistsResponseDto {
  @ApiProperty({ type: [ArtistProfileDto] })
  artists: ArtistProfileDto[];

  @ApiProperty({ type: [ArtistProfileDto] })
  trending: ArtistProfileDto[];

  @ApiProperty({ type: [DiscoveredTrackDto] })
  tracks: DiscoveredTrackDto[];

  @ApiProperty({ type: [DiscoveredFriendCategory] })
  categories: DiscoveredFriendCategory[];
}
