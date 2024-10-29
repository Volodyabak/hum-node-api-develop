export const BRACKHIT_COMMENT_MAX_LENGTH = 256;
export const BRACKHIT_COMMENT_REPLIES_PREVIEW_COUNT = 5;
export const BRACKHIT_COMMENT_REPLIES_COUNT = 10;
export const BRACKHIT_COMMENTS_COUNT = 40;
export const DEFAULT_SUGGESTED_BRACKHITS = [
  350, 309, 736, 224, 269, 332, 735, 883, 737, 778, 628, 1144, 1165, 1588,
];
export const BRACKHIT_CHOICES_MIN_COMPLETIONS = 2;

export const GET_SAVED_BRACKHITS_TAKE_DEFAULT = 25;
export const GET_TOP_BRACKHITS_ITEMS_TAKE_DEFAULT = 25;
export const GET_BRACKHITS_ARTIST_TAKE_DEFAULT = 25;
export const GET_CHALLENGE_LEADERBOARD_TAKE_DEFAULT = 5;
export const GET_BRACKHITS_FTUE_HUB_TAG_TAKE_DEFAULT = 5;
export const GET_BRACKHIT_HOT_TAKES_TAKE_DEFAULT = 10;
export const GET_USER_BRACKHIT_SAVED_TRACKS_TAKE_DEFAULT = 10;
export const GET_DAILY_BRACKHITS_TAKE_DEFAULT = 30;
export const ARTISTORY_NAME = 'artistory';
export const BRACKHIT_URL_BASE = 'https://www.brackhits.com/brackhits/';
export const DEV_BRACKHIT_URL_BASE = 'https://dev.brackhits.com/brackhits/';
export const NOTIFY_OWNER_BRACKHIT_COMPLETIONS = [5, 10, 25, 50, 100, 150, 200, 250, 500, 1000];

export enum BrackhitType {
  Track = 'track',
  Artist = 'artist',
  Theme = 'theme',
  Tiktok = 'tiktok',
}

export enum BrackhitContentType {
  Track = 'track',
  Artist = 'artist',
  Album = 'album',
  Youtube = 'youtube',
  Vimeo = 'vimeo',
  Custom = 'custom',
  TikTok = 'tiktok',
  YoutubeClip = 'youtube_clip',
}

export enum BrackhitScoringState {
  IN_PROGRESS = 0,
  CALCULATING = 1,
  CALCULATED = 2,
}

export enum BrackhitUserStatus {
  None = 'none',
  InProgress = 'in progress',
  Completed = 'completed',
  Results = 'results',
  ALL = 'all',
}

export enum BrackhitUserCompleteStatus {
  NONE = null,
  IN_PROGRESS = 0,
  COMPLETED = 1,
}

export enum BrackhitSize {
  _2 = 2,
  _4 = 4,
  _8 = 8,
  _16 = 16,
  _32 = 32,
  _64 = 64,
}
