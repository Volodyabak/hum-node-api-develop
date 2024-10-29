import {
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import {
  BrackhitScoringState,
  BrackhitType,
  BrackhitUserStatus,
  GET_BRACKHIT_HOT_TAKES_TAKE_DEFAULT,
  GET_BRACKHITS_ARTIST_TAKE_DEFAULT,
  GET_BRACKHITS_FTUE_HUB_TAG_TAKE_DEFAULT,
  GET_DAILY_BRACKHITS_TAKE_DEFAULT,
  GET_SAVED_BRACKHITS_TAKE_DEFAULT,
  GET_USER_BRACKHIT_SAVED_TRACKS_TAKE_DEFAULT,
} from '../constants/brackhits.constants';
import { DATE_EXAMPLE, USER_IMAGE, UUID_V4 } from '../../../api-model-examples';
import {
  BrackhitAdDto,
  BrackhitArtistDto,
  BrackhitChoiceDto,
  BrackhitCompareUserDto,
  BrackhitFtueDto,
  BrackhitResultDto,
  BrackhitUserFriendDto,
  FinalRoundChoiceDto,
  HotTakeDto,
  MasterChoiceDifferenceDto,
  SavedBrackhitDto,
  SavedTrackDto,
} from '../dto/brackhits.dto';
import { DEFAULT_BRACKHIT_IMAGE, S3_TEMP_IMAGE_PREFIX } from '../../../constants';
import { getS3ImagePrefix } from '../../../Tools/utils/image.utils';
import { UserProfileDto, UserTopArtistDto, UserTopTrackDto } from '../../users/dto/users.dto';
import { DatePaginationQueryDto, PaginationQueryDto } from '../../../Tools/dto/main-api.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetBrackhitFriendsResponseDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [BrackhitUserFriendDto] })
  friends: BrackhitUserFriendDto[];
}

export class GetBrackhitFriendsQueryDto extends PaginationQueryDto {}

export class GetTagBrackhitsQueryDto extends DatePaginationQueryDto {}

export class SearchBrackhitsQueryDto extends PaginationQueryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  query: string;
  @ApiProperty({ required: false, example: DATE_EXAMPLE })
  @IsOptional()
  @IsDate()
  date: Date = new Date();
}

export class SuggestBrackhitsQueryDto {
  @ApiProperty({ required: false, example: DATE_EXAMPLE })
  @IsOptional()
  @IsDate()
  date: Date = new Date();
  @ApiProperty({ required: false, example: UUID_V4 })
  @IsOptional()
  @IsUUID(4)
  userId: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  brackhitId: number;
}

export class GetBrackhitsTopItemsQueryDto extends PaginationQueryDto {}

export class GetBrackhitTopArtistsResponseDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [UserTopArtistDto] })
  artists: UserTopArtistDto[];
}

export class GetBrackhitTopTracksResponseDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: UserTopTrackDto })
  tracks: UserTopTrackDto[];
}

export class GetBrackhitAdsResponseDto {
  @ApiProperty({ type: [BrackhitAdDto] })
  brackhits: BrackhitAdDto[];
}

export class FinalRoundChoicesContainerDto {
  @ApiProperty({ type: [FinalRoundChoiceDto] })
  userChoices: FinalRoundChoiceDto[];
  @ApiProperty({ type: [FinalRoundChoiceDto] })
  masterChoices: FinalRoundChoiceDto[];
}

export class CompareMasterBrackhitResponseDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty({ type: BrackhitCompareUserDto })
  tokenUserProfile: BrackhitCompareUserDto;
  @ApiProperty()
  similarity: number;
  @ApiProperty({
    type: FinalRoundChoicesContainerDto,
  })
  finalRoundsChoices: FinalRoundChoicesContainerDto;
  @ApiProperty({ type: [MasterChoiceDifferenceDto] })
  choicesDifference: MasterChoiceDifferenceDto[];
}

export class PutBrackhitUserChoiceParamDto {
  @ApiProperty()
  @IsInt()
  brackhitId: number;
  @ApiProperty()
  @IsInt()
  choiceId: number;
  @ApiProperty()
  @IsInt()
  roundId: number;
}

export class GetSavedBrackhitsResponseDto {
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [SavedBrackhitDto] })
  brackhits: SavedBrackhitDto[];
}

export class GetSavedBrackhitsQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_SAVED_BRACKHITS_TAKE_DEFAULT })
  @IsInt()
  @Min(1)
  take: number = GET_SAVED_BRACKHITS_TAKE_DEFAULT;
}

export class SaveBrackhitBodyDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  brackhitId: number;
}

export class GetBrackhitResultsResponseDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty({ example: UUID_V4 })
  ownerId: string;
  @ApiProperty({ example: DATE_EXAMPLE })
  timeLive: Date;
  @ApiProperty()
  duration: number;
  @ApiProperty()
  size: number;
  @ApiProperty({ example: DEFAULT_BRACKHIT_IMAGE })
  thumbnail: string;
  @ApiProperty()
  url: string;
  @ApiProperty({ example: BrackhitType.Track })
  type: BrackhitType;
  @ApiProperty()
  scoringState: BrackhitScoringState;
  @ApiProperty()
  displaySeeds: 0 | 1;
  @ApiProperty()
  isLive: 0 | 1;
  @ApiProperty()
  userStatus: BrackhitUserStatus;
  @ApiProperty({ type: [BrackhitResultDto] })
  results: BrackhitResultDto[];
}

export class GetDailyStreakResponseDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  streak: number;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty()
  history: (0 | 1)[];
}

export class GetDailyStreakQueryDto {
  @ApiProperty({ required: false, example: DATE_EXAMPLE })
  @IsOptional()
  @IsDate()
  date: Date = new Date();
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_DAILY_BRACKHITS_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @Min(1)
  take: number = GET_DAILY_BRACKHITS_TAKE_DEFAULT;
}

export class GetSavedTracksResponse {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [SavedTrackDto] })
  tracks: SavedTrackDto[];
}

export class GetSavedTracksQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_USER_BRACKHIT_SAVED_TRACKS_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @IsPositive()
  take: number = GET_USER_BRACKHIT_SAVED_TRACKS_TAKE_DEFAULT;
}

export class SaveTrackBodyDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  brackhitId: number;
  @ApiProperty()
  @IsInt()
  @IsPositive()
  choiceId: number;
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsIn([0, 1])
  savedFlag: 0 | 1 = 1;
}

export class GetBrackhitsByHubAndTagResponseDto {
  @ApiProperty()
  hubId: number;
  @ApiProperty()
  tagId: number;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [BrackhitFtueDto] })
  brackhits: BrackhitFtueDto[];
}

export class GetBrackhitsArtistQueryDto {
  @ApiProperty({ required: false, example: DATE_EXAMPLE })
  @IsOptional()
  @IsDate()
  date: Date = new Date();
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_BRACKHITS_ARTIST_TAKE_DEFAULT })
  @IsOptional()
  @Min(0)
  take: number = GET_BRACKHITS_ARTIST_TAKE_DEFAULT;
}

export class GetBrackhitsByHubAndTagQueryDto {
  @ApiProperty({ required: false, example: DATE_EXAMPLE })
  @IsOptional()
  @IsDate()
  date: Date = new Date();
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_BRACKHITS_FTUE_HUB_TAG_TAKE_DEFAULT })
  @IsOptional()
  @Min(0)
  take: number = GET_BRACKHITS_FTUE_HUB_TAG_TAKE_DEFAULT;
}

export class GetBrackhitHotTakesQueryDto {
  @ApiProperty({
    description:
      'A positive integer value used for random hot takes sorting. For equal seed values the same sequence of items will be returned.',
  })
  @Min(1)
  seed: number;
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_BRACKHIT_HOT_TAKES_TAKE_DEFAULT })
  @IsOptional()
  @Min(0)
  take: number = GET_BRACKHIT_HOT_TAKES_TAKE_DEFAULT;
}

export class GetBrackhitsArtistResponseDto {
  @ApiProperty()
  artistId: number;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [BrackhitArtistDto] })
  brackhits: BrackhitArtistDto[];
}

export class GetBrackhitHotTakesResponseDto {
  @ApiProperty()
  seed: number;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [HotTakeDto] })
  items: HotTakeDto[];
}

export class GetBrackhitResponseDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty({ example: UUID_V4 })
  ownerId: string;
  @ApiProperty()
  owner: string;
  @ApiProperty({ example: USER_IMAGE })
  ownerImage: string;
  @ApiProperty()
  influencerType: number;
  @ApiProperty({ example: DATE_EXAMPLE })
  timeLive: Date;
  @ApiProperty()
  duration: number;
  @ApiProperty()
  size: number;
  @ApiProperty({ example: DEFAULT_BRACKHIT_IMAGE })
  thumbnail: string;
  @ApiProperty()
  url: string;
  @ApiProperty({ example: BrackhitType.Track })
  type: BrackhitType;
  @ApiProperty()
  scoringState: BrackhitScoringState;
  @ApiProperty()
  displaySeeds: 0 | 1;
  @ApiProperty()
  thirdPlace: 0 | 1;
  @ApiProperty()
  startingRound: number;
  @ApiProperty()
  isComplete: number;
  @ApiProperty()
  centralId: number;
  @ApiProperty()
  isLive: 0 | 1;
  @ApiProperty()
  userStatus: BrackhitUserStatus;
  @ApiProperty({ type: [BrackhitChoiceDto] })
  choices: BrackhitChoiceDto[];
}

export class UpdateBrackhitDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(`^(${S3_TEMP_IMAGE_PREFIX}|${getS3ImagePrefix()})`)
  thumbnail?: string;
}

export class UploadBrackhitImageResponse {
  @ApiProperty()
  thumbnail: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  key: string;
}

export class GetBrackhitUsersQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  isComplete?: number;
}

export class GetBrackhitUsersResponseDto extends UserProfileDto {
  @ApiProperty()
  brackhitId: number;

  @ApiProperty()
  isComplete: number;
}

export class GetBrackhitAnswersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID(4)
  userId: string;
}

export class PostBrackhitAnswersDto {
  @ApiProperty()
  @IsUUID(4)
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  campaignId: number;
}
