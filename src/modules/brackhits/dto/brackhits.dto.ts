import { ApiProperty } from '@nestjs/swagger';
import { BrackhitContentType, BrackhitUserStatus } from '../constants/brackhits.constants';
import { BRACKHIT_THUMBNAIL, MODEL_ID, USER_IMAGE, UUID_V4 } from '../../../api-model-examples';
import { DEFAULT_ALBUM_IMAGE } from '../../../constants';
import { TrackInfoDto } from '../../tracks/tracks.dto';
import { BrackhitChoiceWithContent } from '../interfaces/brackhits.interface';
import { TiktokModel } from '@database/Models/tiktok.model';

export class BrackhitUserFriendDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  userImage: string;
  @ApiProperty()
  influencerType: number;
}

export class SharedBrackhitDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: BRACKHIT_THUMBNAIL })
  thumbnail: string;
}

export class SuggestedBrackhitDto {
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

export class BrackhitAdDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  thumbnail: string;
}

export class FinalRoundChoiceDto {
  @ApiProperty()
  choiceId: number;
  @ApiProperty()
  roundId: number;
  @ApiProperty()
  trackKey: string;
  @ApiProperty()
  trackName: string;
  @ApiProperty()
  preview: string;
  @ApiProperty()
  albumImage: string;
  @ApiProperty()
  artists: string;
}

export class MasterChoiceDifferenceDto {
  @ApiProperty()
  choiceId: number;
  @ApiProperty()
  userRoundId: number;
  @ApiProperty()
  masterRoundId: number;
  @ApiProperty()
  trackKey: string;
  @ApiProperty()
  trackName: string;
  @ApiProperty()
  preview: string;
  @ApiProperty()
  albumImage: string;
  @ApiProperty()
  artists: string;
}

export class BrackhitCompareUserDto {
  @ApiProperty()
  userId: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  userImage: string;
  @ApiProperty()
  influencerType: number;
}

export class SavedBrackhitDto {
  @ApiProperty({ example: MODEL_ID })
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: BRACKHIT_THUMBNAIL })
  thumbnail: string;
}

export class SavedTrackBrackhitDto {
  @ApiProperty({ example: MODEL_ID })
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: BRACKHIT_THUMBNAIL })
  thumbnail: string;
}

export class SavedTrackDto {
  @ApiProperty({ example: MODEL_ID })
  choiceId: number;
  @ApiProperty({ example: MODEL_ID })
  contentId: number;
  @ApiProperty({ type: TrackInfoDto })
  content: TrackInfoDto;
  @ApiProperty({ type: SavedTrackBrackhitDto })
  brackhit: SavedTrackBrackhitDto | undefined[];
}

export class RecommendedBrackhitDto {
  brackhitId: number;
  brackhitName: string;
  artistId: number;
  artistName: string;
  rank: number;
}

export class BrackhitFtueDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: BRACKHIT_THUMBNAIL })
  thumbnail: string;
}

export class BrackhitChoiceDto implements BrackhitChoiceWithContent {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  seed: number;
  @ApiProperty()
  roundId: number;
  @ApiProperty()
  choiceId: number;
  @ApiProperty()
  type: BrackhitContentType;
  @ApiProperty()
  contentId: number;
  @ApiProperty()
  votes: number;
  @ApiProperty({ type: TrackInfoDto })
  content: TrackInfoDto | TiktokModel;
}

export class BrackhitResultDto implements BrackhitChoiceWithContent {
  @ApiProperty()
  seed: number;
  @ApiProperty()
  roundId: number;
  @ApiProperty()
  choiceId: number;
  @ApiProperty()
  type: BrackhitContentType;
  @ApiProperty()
  contentId: number;
  @ApiProperty()
  votes: number;
  @ApiProperty({ type: TrackInfoDto })
  content: TrackInfoDto;
}

export class BrackhitChoicesParams {
  withVotes?: boolean;
}

export class HotTakeChoiceContentDto {
  @ApiProperty()
  choiceId: number;
  @ApiProperty()
  trackName: string;
  @ApiProperty({ example: DEFAULT_ALBUM_IMAGE })
  albumImage: string;
  @ApiProperty()
  artists: string;
}

export class HotTakeUserDto {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty()
  username: string;
  @ApiProperty({ example: USER_IMAGE })
  userImage: string;
}

export class HotTakeMetaDto {
  brackhitId: number;
  name: string;
  roundId: string;
  firstChoiceId: number;
  secondChoiceId: number;
  firstChoice: HotTakeChoiceContentDto;
  secondChoice: HotTakeChoiceContentDto;
  userId: string;
  username: string;
  userImage: string;
}

export class HotTakeDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  roundId: string;
  @ApiProperty({ type: HotTakeChoiceContentDto })
  firstChoice: HotTakeChoiceContentDto;
  @ApiProperty({ type: HotTakeChoiceContentDto })
  secondChoice: HotTakeChoiceContentDto;
  @ApiProperty({ type: HotTakeUserDto })
  user: HotTakeUserDto;
}

export class BrackhitWithStatusDto {
  isCompleted: number;
  scoringState: number;
}

// contains timeLive and duration properties
export class LiveBrackhitDto {
  timeLive: Date;
  duration: number;
}

export class UserFriendBrackhitDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: BRACKHIT_THUMBNAIL })
  thumbnail: string;
  @ApiProperty()
  similarity: number;
}

export class BrackhitArtistDto {
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  ownerId: string;
  @ApiProperty()
  timeLive: Date;
  @ApiProperty()
  duration: number;
  @ApiProperty()
  size: number;
  @ApiProperty({ example: BRACKHIT_THUMBNAIL })
  thumbnail: string;
  @ApiProperty()
  url: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  scoringState: number;
  @ApiProperty()
  displaySeeds: number;
  @ApiProperty()
  isLive: 0 | 1;
  @ApiProperty({ example: BrackhitUserStatus.InProgress })
  userStatus: BrackhitUserStatus;
}

export class YoutubeVideoInfoDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  youtubeKey: string;
  @ApiProperty()
  videoTitle: string;
}

export class VimeoVideoInfoDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  vimeoId: number;
  @ApiProperty()
  videoTitle: string;
}
