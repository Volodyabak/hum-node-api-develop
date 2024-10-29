import { IsDate, IsEnum, IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import {
  BRACKHIT_CARDS_TAKE_QUERY_DEFAULT,
  BRACKHIT_TOP_USERS_TAKE_QUERY_DEFAULT,
  BrackhitCardTypes,
  BrackhitCategory,
  BrackhitHubs,
  CategoryType,
} from '../constants/brackhits-hub.constants';
import { BRACKHIT_THUMBNAIL, USER_IMAGE, UUID_V4 } from '../../../api-model-examples';
import { BrackhitUserStatus } from '../constants/brackhits.constants';
import { ApiProperty } from '@nestjs/swagger';

export class TopUsersParamsDto {
  completionUsersCount: number;
  voteUsersCount: number;
}

/***
 * Brackhit object containing fields required to properly identify isLive and userStatus values
 * and parse this object into an object for hub screen
 */
export class BrackhitMetaDto {
  brackhitId: number;
  name: string;
  thumbnail: string;
  timeLive: Date;
  duration: number;
  scoringState: number;
  isCompleted: number;
  userStatus?: BrackhitUserStatus;
}

/***
 * Properties:
 * onlyNoneStatus (optional) - if true, then brackhits with userStatus=None will be returned
 */
export class ForYouBrackhitsParamsDto {
  onlyNoneStatus?: boolean;
}

/***
 * Brackhit item structure for brackhit categories
 */
export class BrackhitItemDto {
  @ApiProperty()
  brackhitId: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: BRACKHIT_THUMBNAIL })
  thumbnail: string;

  @ApiProperty()
  isLive: 0 | 1;

  @ApiProperty({ example: BrackhitUserStatus.None })
  userStatus: BrackhitUserStatus;
}

/***
 * Hub item structure for hub categories
 */
export class HubItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;
}

export class TopUserProfileDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ example: USER_IMAGE })
  userImage: string;
}

/***
 * User item structure for user categories
 */
export class UserItemDto {
  @ApiProperty({ example: BrackhitCardTypes.Five })
  cardType: BrackhitCardTypes;

  @ApiProperty()
  userValue: number;

  @ApiProperty({ type: TopUserProfileDto })
  profile: TopUserProfileDto;
}

export class CategoryItemsData {
  skip: number;
  take: number;
  total: number;
  items: (BrackhitItemDto | HubItemDto | UserItemDto)[];
}

/***
 * Route params for Brackhit Hub screen
 */
export class GetHomeBrackhitsParamsDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  hubId: BrackhitHubs;
}

/***
 * Query params for Top Users screen
 */
export class GetBrackhitTopUsersQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(BrackhitCategory)
  categoryId: BrackhitCategory;

  @ApiProperty({ required: false })
  @IsInt()
  skip: number = 0;

  @ApiProperty({ required: false, example: BRACKHIT_TOP_USERS_TAKE_QUERY_DEFAULT })
  @IsInt()
  take: number = BRACKHIT_TOP_USERS_TAKE_QUERY_DEFAULT;
}

/***
 * Query params for Brackhit Hub screen
 */
export class GetHomeBrackhitsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  date: Date = new Date();

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  categoryId: BrackhitCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @Min(0)
  skip: number = 0;

  @ApiProperty({ required: false, example: BRACKHIT_CARDS_TAKE_QUERY_DEFAULT })
  @IsOptional()
  @Min(1)
  take: number = BRACKHIT_CARDS_TAKE_QUERY_DEFAULT;
}

/***
 * Category card structure on Brackhit Hub screen
 */
export class CategoryCardDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Featured' })
  name: string;

  @ApiProperty({ example: CategoryType.Category })
  type: CategoryType;

  @ApiProperty({ example: BrackhitCardTypes.Two })
  cardType: BrackhitCardTypes;

  @ApiProperty()
  skip: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [BrackhitItemDto] })
  items: (BrackhitItemDto | HubItemDto | UserItemDto)[];
}

/***
 * Category card structure on Brackhit Hub screen
 */
export class CategoryUserCardDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Most Completions' })
  name: string;

  @ApiProperty({ example: CategoryType.Category })
  type: CategoryType;

  @ApiProperty({ example: BrackhitCardTypes.Five })
  cardType: BrackhitCardTypes;

  @ApiProperty()
  skip: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [UserItemDto] })
  items: (BrackhitItemDto | HubItemDto | UserItemDto)[];
}

/***
 * Response structure of Brackhit Home and Hub screens
 */
export class GetHomeBrackhitsResponseDto {
  @ApiProperty({ example: 6 })
  id: number;

  @ApiProperty({ example: 'Rock' })
  name: string;

  @ApiProperty({ example: 0 })
  skip: number = 0;

  @ApiProperty({ example: BRACKHIT_CARDS_TAKE_QUERY_DEFAULT })
  take: number = BRACKHIT_CARDS_TAKE_QUERY_DEFAULT;

  @ApiProperty({ example: 20 })
  total: number;

  @ApiProperty({ type: [CategoryCardDto] })
  items: CategoryCardDto[];
}

/***
 * Response structure of Brackhit Home and Hub screens
 */
export class GetTopUsersResponseDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Top Users' })
  name: string;

  @ApiProperty({ example: 0 })
  skip: number = 0;

  @ApiProperty({ example: BRACKHIT_CARDS_TAKE_QUERY_DEFAULT })
  take: number = BRACKHIT_CARDS_TAKE_QUERY_DEFAULT;

  @ApiProperty({ example: 20 })
  total: number;

  @ApiProperty({ type: [CategoryUserCardDto] })
  items: CategoryUserCardDto[];
}
