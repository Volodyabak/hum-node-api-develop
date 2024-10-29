import { PaginationParams } from '../../../Tools/dto/util-classes';
import { BrackhitUserChoicesModel } from '../../../../database/Models/BrackhitUserChoicesModel';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { SpotifyTrackModel } from '../../../../database/Models';
import { BrackhitContentModel } from '@database/Models/Brackhit/BrackhitContentModel';

export type UserTopChoiceMeta = BrackhitUserChoicesModel &
  BrackhitModel &
  BrackhitContentModel &
  SpotifyTrackModel;

export interface UserBrackhitChoiceMeta {
  userId: string;
  brackhitId: number;
  roundId: number;
  choiceId: number;
  contentId: number;
  type: string;
  trackKey: string;
  trackName: string;
  preview: string;
  albumImage: string;
  artists: string;
}

export interface IUsersInterface {
  searchUsersByQuery(query: string);

  getAWSUser(userId: string);

  getUserArtistCount(userId: string);

  getUserProfileInfo(userId: string);

  getUserFriends(userId: string, params: { take: number; skip: number });

  getUserFriendsWithCompatibility(userId: string, params: { take: number; skip: number });

  getUserBadges(userId: string);

  getUserGenres(userId: string);

  getUserTopCategories(userId: string);

  getUserTopRecentTracksDB(userId: string, params: PaginationParams);

  getUserMostListenedArtistsDB(userId: string, params: PaginationParams);
}
