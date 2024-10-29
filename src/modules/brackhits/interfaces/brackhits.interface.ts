import { Transaction } from 'objection';
import { BrackhitContentType, BrackhitSize } from '../constants/brackhits.constants';
import { TrackInfoDto } from '../../tracks/tracks.dto';
import { VimeoVideoInfoDto, YoutubeVideoInfoDto } from '../dto/brackhits.dto';
import { ArtistModel, SpotifyAlbumModel } from '@database/Models';
import { CustomContentModel } from '@database/Models/campaign/custom-content.model';
import { TiktokModel } from '@database/Models/tiktok.model';
import { YoutubeClipModel } from '@database/Models/Artist/YoutubeClipModel';

export interface RoundUserCompareChoices {
  roundId: number;
  userChoiceId: number;
  compareChoiceId: number;
}
export interface SortBrackhitsByCompletionsInLastDaysParams {
  date: Date;
  days: number;
  from: string;
  to: string;
}

export interface BrackhitTotalSharesParams {
  minDate?: Date;
}

export interface SuggestUserBrackhitsParams {
  userId: string;
  date: Date;
}

export interface SuggestBrackhitsParams {
  brackhitId: number;
  date: Date;
}

export interface BrackhitTopParams {
  skip: number;
  take: number;
  excludeTotal?: boolean;
}

export interface BrackhitChoicesDiffParams extends TrackInfoParams {
  userRoundName: string;
  compareRoundName: string;
}

export interface TrackInfoParams {
  excludeArtists: boolean;
  groupByRound: boolean;
}

export interface BrackhitWithDuplicateTracksCount {
  size: BrackhitSize;
  duplicates: number;
}

export interface BrackhitWithSize {
  brackhitId: number;
  size: BrackhitSize;
}

export interface DailyBrackhitCompletion {
  brackhitId: number;
  date: Date;
  isComplete: 0 | 1;
  updatedAt: Date;
  initialCompleteTime: Date;
}

export interface BrackhitChoiceWithVotes {
  brackhitId: number;
  roundId: number;
  choiceId: number;
  votes: number;
  winner?: number;
}

export type BrackhitChoiceWinnerWithPercent = BrackhitChoiceWithVotes & { percent: number };

export interface BrackhitMetaParams {
  fetchOwner: boolean;
}

export interface BrackhitChoiceWithContent {
  contentId: number;
  type: BrackhitContentType;
  content:
    | TrackInfoDto
    | SpotifyAlbumModel
    | ArtistModel
    | YoutubeVideoInfoDto
    | VimeoVideoInfoDto
    | TiktokModel
    | CustomContentModel
    | YoutubeClipModel;
}

export interface IBrackhitsRepository {
  getUserBrackhit(brackhitId: number, userId: string);

  deleteUserBrackhitChoices(brackhitId: number, userId: string, trx?: Transaction);

  resetUserBrackhit(brackhitId: number, userId: string, completeTime: Date, trx?: Transaction);

  deleteUserBrackhitScore(brackhitId: number, userId: string, trx?: Transaction);

  logBrackhitResets(brackhitId: number, userId: string, trx?: Transaction);

  getUserFriendCompatibilityBrackhitsQB(userId: string, friendId: string);

  getUsersBrackhitSimilarity(brackhitId: number, firstUserId: string, secondUserId: string);
}
