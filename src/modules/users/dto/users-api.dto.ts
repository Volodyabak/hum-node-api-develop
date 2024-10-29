import { ApiProperty } from '@nestjs/swagger';
import { ArtistModel, AWSUsersModel } from '../../../../database/Models';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { DATE_EXAMPLE, USER_IMAGE, UUID_V4 } from '../../../api-model-examples';
import {
  UserArtistDto,
  UserBrackhitDto,
  UserCreatedBrackhitDto,
  UserCreatedBrackhitPreviewDto,
  UserTopStatsDto,
} from './users.dto';
import {
  GET_USER_BRACKHITS_TAKE_DEFAULT,
  GET_USER_BY_ID_TAKE_DEFAULT,
  GET_USER_SPOTIFY_TRACKS_TAKE_DEFAULT,
  UserDeviceTypes,
} from '../constants';
import { UserRelationship } from '../../friends/constants';
import {
  BrackhitSize,
  GET_BRACKHITS_ARTIST_TAKE_DEFAULT,
} from '../../brackhits/constants/brackhits.constants';
import { GET_USER_SPOTIFY_PLAYLISTS_MAX_LIMIT } from '../../spotify/constants';
import { SpotifyUserPlaylistsDto } from '../../spotify/dto/spotify.dto';
import { PaginationResponseDto } from '../../../Tools/dto/main-api.dto';
import { SharedBrackhitDto } from '../../brackhits/dto/brackhits.dto';
import { FeedSources } from '../../feed/constants/feed.constants';
import { FeedItemSource } from '../../feed/interfaces/feed.interfaces';

export class AddUserEmailsBodyDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  emails: string[];
}

export class GetSharedBrackhitsResponseDto extends PaginationResponseDto {
  @ApiProperty({ example: UUID_V4 })
  tokenUserId: string;
  @ApiProperty({ example: UUID_V4 })
  paramUserId: string;
  @ApiProperty({ type: [SharedBrackhitDto] })
  brackhits: SharedBrackhitDto[];
}

export class PostUserGetMeBodyDto {
  @ApiProperty()
  @IsEnum(UserDeviceTypes)
  deviceType: UserDeviceTypes;
}

export class GetSpotifyUserPlaylistsResponseDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  skip?: number;
  @ApiProperty()
  take?: number;
  @ApiProperty()
  total?: number;
  @ApiProperty({ type: [SpotifyUserPlaylistsDto] })
  playlists: SpotifyUserPlaylistsDto[];
}

export class GetUserSpotifyPlaylistsQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsIn([0, 1])
  preview: 0 | 1 = 0;

  @ApiProperty({ required: false, default: BrackhitSize._16 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  size: BrackhitSize = BrackhitSize._16;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  @IsInt()
  skip: number = 0;

  @ApiProperty({
    required: false,
    default: GET_USER_SPOTIFY_TRACKS_TAKE_DEFAULT,
    maximum: GET_USER_SPOTIFY_PLAYLISTS_MAX_LIMIT,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(GET_USER_SPOTIFY_PLAYLISTS_MAX_LIMIT)
  take: number = GET_USER_SPOTIFY_TRACKS_TAKE_DEFAULT;
}

export class PostUserArtistsFollowBodyDto {
  @ApiProperty({ example: [1, 2, 3] })
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  artistIds: number[];
  @ApiProperty()
  @IsIn([0, 1])
  following: 0 | 1;
}

export class GetUserArtistsQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  skip: number = 0;

  @ApiProperty({ required: false, default: GET_BRACKHITS_ARTIST_TAKE_DEFAULT })
  @IsOptional()
  @Min(0)
  take: number = GET_BRACKHITS_ARTIST_TAKE_DEFAULT;
}

export class UserBrackhitIdsParamDto {
  @ApiProperty()
  @IsUUID(4)
  userId: string;
}

export class GetUserArtistsResponseDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [UserArtistDto] })
  artists: UserArtistDto[];
}

export class GetUserByIdResponse {
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
  @ApiProperty({ example: DATE_EXAMPLE })
  createdAt: Date;
  @ApiProperty({ example: DATE_EXAMPLE })
  updatedAt: Date;
  @ApiProperty()
  profileComplete: boolean;
  @ApiProperty({ example: DATE_EXAMPLE })
  joinDate: Date;
  @ApiProperty()
  followedArtistsCount: number;
  @ApiProperty()
  friendsCount: number;
  @ApiProperty({ example: UserRelationship.FRIEND })
  relationship: UserRelationship;
  @ApiProperty()
  totalCompletedBrackhits: number;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [UserCreatedBrackhitPreviewDto] })
  createdBrackhits: UserCreatedBrackhitPreviewDto[];
}

export class GetUserByIdQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  skip: number = 0;

  @ApiProperty({ required: false, default: GET_USER_BY_ID_TAKE_DEFAULT })
  @IsOptional()
  @Min(0)
  take: number = GET_USER_BY_ID_TAKE_DEFAULT;
}

export class GetUserBrackhitsQueryDto {
  @ApiProperty({
    required: false,
    description: 'Specifies whether completed or not completed brackhits will be returned',
  })
  @IsOptional()
  @IsIn([0, 1])
  completed: 0 | 1;

  @ApiProperty({ required: false, default: 0, description: 'offset for created brackhits' })
  @IsOptional()
  @Min(0)
  skipCB: number = 0;

  @ApiProperty({
    required: false,
    default: GET_USER_BRACKHITS_TAKE_DEFAULT,
    description: 'limit for created brackhits',
  })
  @IsOptional()
  @Min(0)
  takeCB: number = GET_USER_BRACKHITS_TAKE_DEFAULT;

  @ApiProperty({ required: false, default: 0, description: 'offset for user brackhits' })
  @IsOptional()
  @Min(0)
  skipUB: number = 0;

  @ApiProperty({
    required: false,
    default: GET_USER_BRACKHITS_TAKE_DEFAULT,
    description: 'limit for user brackhits',
  })
  @IsOptional()
  @Min(0)
  takeUB: number = GET_USER_BRACKHITS_TAKE_DEFAULT;
}

export class GetUserResponseDto {
  @ApiProperty()
  skip: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ isArray: true, type: AWSUsersModel })
  users: AWSUsersModel[];
}

export class GetUserBrackhitsResponseDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty()
  skipUB: number;

  @ApiProperty()
  takeUB: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  completedCount: number;

  @ApiProperty({ type: [UserBrackhitDto] })
  brackhits: UserBrackhitDto[];

  @ApiProperty()
  skipCB: number;

  @ApiProperty()
  takeCB: number;

  @ApiProperty()
  created: number;

  @ApiProperty({ type: [UserCreatedBrackhitDto] })
  createdBrackhits: UserCreatedBrackhitDto[];

  @ApiProperty({ type: UserTopStatsDto })
  topStats: UserTopStatsDto;
}

export class UserLikesOutput extends PaginationResponseDto {
  @ApiProperty()
  data: UserLikeData[];
}

export class UserLikeData {
  @ApiProperty()
  centralId: number;
  @ApiProperty()
  feedType: FeedSources;
  @ApiProperty()
  timestamp: Date;
  @ApiProperty()
  artist: Pick<ArtistModel, 'id' | 'name' | 'image'>;
  @ApiProperty()
  source: FeedItemSource;
}
