import { getS3ImagePrefix } from './Tools/utils/image.utils';

export enum Environment {
  PROD = 'production',
  DEV = 'stage',
  LOCAL = 'local',
}

export const GUEST_USER_ID = 'd695c2ae-5464-4dd3-848f-58b3e2ddfee1';

export const DEFAULT_USER_IMAGE = getS3ImagePrefix() + 'default/avatar.png';
export const DEFAULT_ALBUM_IMAGE = getS3ImagePrefix() + 'default/albumDefault.png';
export const DEFAULT_BRACKHIT_IMAGE = getS3ImagePrefix() + 'default/brackhitsDefault.png';

export const S3_TEMP_IMAGE_PREFIX = 'temp/';

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const DEFAULT_TAKE = 25;

export const ONE_SIGNAL_BATCH_SIZE = 2000;

export const NUMBER_ORDINALS = ['th', 'st', 'nd', 'rd'];

export enum RequestAppType {
  WEB = 'web',
  APP = 'app',
}

export const whiteListedOrigins = [/artistory\.io/, /brackhits\.com/];

export enum ErrorConst {
  NO_AUTH_TOKEN = 'NO_AUTH_TOKEN',
  INVALID_API_KEY = 'INVALID_API_KEY',

  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_DOES_NOT_EXIST = 'USER_DOES_NOT_EXIST',
  USER_DOES_NOT_FOLLOW_ARTISTS = 'USER_DOES_NOT_FOLLOW_ARTISTS',

  INCORRECT_USERNAME_OR_PASSWORD = 'INCORRECT_USERNAME_OR_PASSWORD',

  RECORD_ALREADY_EXISTS = 'RECORD_ALREADY_EXISTS',

  LINK_OR_PLAYLIST_REQUIRED = 'LINK_OR_PLAYLIST_REQUIRED',
  LINK_AND_PLAYLIST_CAN_NOT_BE_SPECIFIED_BOTH = 'LINK_AND_PLAYLIST_CAN_NOT_BE_SPECIFIED_BOTH',
  PLAYLIST_MUST_HAVE_AT_LEAST_16_TRACKS = 'PLAYLIST_MUST_HAVE_AT_LEAST_16_TRACKS',
  LOCAL_TRACKS_IS_PROHIBITED = 'LOCAL_TRACKS_IS_PROHIBITED',
  TRACKS_MUST_BE_UNIQUE = 'TRACKS_MUST_BE_UNIQUE',
  BAD_PLAYLIST_LENGTH = 'BAD_PLAYLIST_LENGTH',

  BRACKHIT_NOT_FOUND = 'BRACKHIT_NOT_FOUND',
  BRACKHIT_RESULTS_ARE_NOT_READY = 'BRACKHIT_RESULTS_ARE_NOT_READY',
  BRACKHIT_IS_NOT_COMPLETED = 'BRACKHIT_IS_NOT_COMPLETED',
  BRACKHIT_IS_ALREADY_COMPLETED = 'BRACKHIT_IS_ALREADY_COMPLETED',
  USER_IS_NOT_BRACKHIT_OWNER = 'USER_IS_NOT_BRACKHIT_OWNER',
  BRACKHIT_NAME_IS_NOT_UNIQUE = 'BRACKHIT_NAME_IS_NOT_UNIQUE',

  WRONG_SCREEN_ID_HUB_ID_COMBINATION = 'WRONG_SCREEN_ID_HUB_ID_COMBINATION',
  BRACKHIT_ID_REQUIRED_FOR_GIVEN_SCREEN_ID = 'BRACKHIT_ID_REQUIRED_FOR_GIVEN_SCREEN_ID',

  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  COMMENT_DOES_NOT_BELONG_USER = 'COMMENT_DOES_NOT_BELONG_USER',
  COMMENT_REPLY_NOT_FOUND = 'COMMENT_REPLY_NOT_FOUND',
  COMMENT_REPLY_DOES_NOT_BELONG_USER = 'COMMENT_REPLY_DOES_NOT_BELONG_USER',
  COMMENT_LIKE_ALREADY_EXIST = 'COMMENT_LIKE_ALREADY_EXIST',
  COMMENT_LIKE_NOT_FOUND = 'COMMENT_LIKE_NOT_FOUND',
  REPLY_LIKE_ALREADY_EXIST = 'COMMENT_LIKE_ALREADY_EXIST',
  REPLY_LIKE_NOT_FOUND = 'REPLY_LIKE_NOT_FOUND',
  COMMENT_FLAG_ALREADY_EXIST = 'COMMENT_FLAG_ALREADY_EXIST',
  REPLY_FLAG_ALREADY_EXIST = 'REPLY_FLAG_ALREADY_EXIST',

  BOTH_BRACKHIT_ID_AND_ROUND_ID_REQUIRED = 'BOTH_BRACKHIT_ID_AND_ROUND_ID_REQUIRED',

  INVALID_HOME_CATEGORY_ID = 'INVALID_HOME_CATEGORY_ID',
  INVALID_HUB_CATEGORY_ID = 'INVALID_HUB_CATEGORY_ID',
  INVALID_CATEGORY_TYPE = 'INVALID_CATEGORY_TYPE',
  INVALID_HOME_TAG_ID = 'INVALID_HOME_TAG_ID',
  INVALID_HUB_TAG_ID = 'INVALID_HUB_TAG_ID',
  INVALID_SORTING_TYPE = 'INVALID_SORTING_TYPE',

  ARTIST_NOT_FOUND = 'ARTIST_NOT_FOUND',

  AWS_USER_NOT_FOUND = 'AWS_USER_NOT_FOUND',
  USER_PROFILE_NOT_FOUND = 'USER_PROFILE_NOT_FOUND',
  CAN_NOT_DELETE_GUEST_USER = 'CAN_NOT_DELETE_GUEST_USER',

  WRONG_CHOICE_FOR_ROUND = 'WRONG_CHOICE_FOR_ROUND',
  BRACKHIT_ALREADY_COMPLETED = 'BRACKHIT_ALREADY_COMPLETED',

  INTEGRATION_URL_ALREADY_IN_USE = 'INTEGRATION_URL_ALREADY_IN_USE',

  CAMPAIGN_NOT_FOUND = 'CAMPAIGN_NOT_FOUND',
  CAMPAIGN_ALREADY_EXISTS = 'CAMPAIGN_ALREADY_EXISTS',
  CAMPAIGN_DOES_NOT_BELONG_BALLOT = 'CAMPAIGN_DOES_NOT_BELONG_BALLOT',
  USER_ALREADY_COMPLETE_CAMPAIGN_BRACKHIT = 'USER_ALREADY_COMPLETE_CAMPAIGN_BRACKHIT',
  INCORRECT_NUMBER_OF_CHOICES = 'INCORRECT_NUMBER_OF_CHOICES',
  INVALID_HUB_ID = 'INVALID_HUB_ID',
  COMPANY_NOT_FOUND = 'COMPANY_NOT_FOUND',
  RECORD_DOES_NOT_EXIST = 'RECORD_DOES_NOT_EXIST',
  RECORD_DELETION_IS_FORBIDDEN = 'RECORD_DELETION_IS_FORBIDDEN',
  USER_IS_NOT_OWNER = 'USER_IS_NOT_OWNER',

  FAILED_TO_SAVE_MUSIC_USER_TOKEN = 'FAILED_TO_SAVE_MUSIC_USER_TOKEN',
  MUSIC_USER_TOKEN_NOT_FOUND = 'MUSIC_USER_TOKEN_NOT_FOUND',
  MUSIC_USER_TOKEN_EXPIRED = 'MUSIC_USER_TOKEN_EXPIRED',

  EVENT_NOT_FOUND = 'EVENT_NOT_FOUND',

  COORDINATES_OR_RADIUS_REQUIRED = 'COORDINATES_OR_RADIUS_REQUIRED',
  CAMPAIGN_SLUG_NOT_FOUND = 'CAMPAIGN_SLUG_NOT_FOUND',
  SHARE_SLUG_NOT_FOUND = 'SHARE_SLUG_NOT_FOUND',
  UNKNOWN_ACTION = 'UNKNOWN_ACTION',
  LIKE_NOT_FOUND = 'LIKE_NOT_FOUND',

  BALLOT_NOT_FOUND = 'BALLOT_NOT_FOUND',
  USER_ALREADY_VOTED = 'USER_ALREADY_VOTED',
  COMPANY_ALREADY_EXISTS = 'COMPANY_ALREADY_EXISTS',
  USER_DOES_NOT_BELONG_TO_COMPANY = 'USER_DOES_NOT_BELONG_TO_COMPANY',
  GAME_ID_IS_REQUIRED = 'GAME_ID_IS_REQUIRED',
  BRACKHIT_DOES_NOT_BELONGS_TO_CAMPAIGN = 'BRACKHIT_DOES_NOT_BELONGS_TO_CAMPAIGN',
  FILE_DOES_NOT_BELONGS_TO_CAMPAIGN = 'FILE_DOES_NOT_BELONGS_TO_CAMPAIGN',
  BALLOT_DOES_NOT_BELONGS_TO_CAMPAIGN = 'BALLOT_DOES_NOT_BELONGS_TO_CAMPAIGN',
  TRIVIA_DOES_NOT_BELONGS_TO_CAMPAIGN = 'TRIVIA_DOES_NOT_BELONGS_TO_CAMPAIGN',
  TRIVIA_NOT_FOUND = 'TRIVIA_NOT_FOUND',
  TRIVIA_DOES_NOT_BELONGS_TO_USER = 'TRIVIA_DOES_NOT_BELONGS_TO_USER',
  BALLOT_DOES_NOT_BELONGS_TO_USER = 'BALLOT_DOES_NOT_BELONGS_TO_USER',
}
