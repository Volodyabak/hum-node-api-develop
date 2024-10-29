import { BrackhitCommentTypes } from '../brackhits/constants/brackhits-comments.constants';

export interface AppEventHeaders {
  delay: number;
}

export interface AppEvent {
  eventName: AppEventName;
  eventData: AppEventPayload[AppEventName];
  headers?: AppEventHeaders;
}

export enum AppEventName {
  CREATE_USER = 'CREATE_USER',
  CONNECT_SPOTIFY = 'CONNECT_SPOTIFY',
  USER_SENT_FRIEND_REQUEST = 'USER_SENT_FRIEND_REQUEST',
  USER_ACCEPTED_FRIEND_REQUEST = 'USER_ACCEPTED_FRIEND_REQUEST',
  CREATE_BRACKHIT = 'CREATE_BRACKHIT',
  USER_COMPLETE_BRACKHIT = 'USER_COMPLETE_BRACKHIT',
  CALCULATE_BRACKHIT_RESULTS = 'CALCULATE_BRACKHIT_RESULTS',
  BRACKHIT_CREATOR_COMPLETIONS_NOTIFICATION = 'BRACKHIT_CREATOR_COMPLETIONS_NOTIFICATION',
  COMMENT_BRACKHIT = 'COMMENT_BRACKHIT',
  REPLY_BRACKHIT_COMMENT = 'REPLY_BRACKHIT',
  BRACKHIT_COMMENT_LIKE = 'BRACKHIT_COMMENT_LIKE',
  CREATE_BRACKHIT_CHALLENGE = 'CREATE_BRACKHIT_CHALLENGE',
  FETCH_USER_SPOTIFY_TOP_TRACKS = 'FETCH_USER_SPOTIFY_TOP_TRACKS',
  FETCH_USER_SPOTIFY_TOP_ARTISTS = 'FETCH_USER_SPOTIFY_TOP_ARTISTS',
  KEEP_CONNECTION = 'KEEP_CONNECTION',
}

export interface AppEventPayload {
  [AppEventName.CREATE_BRACKHIT_CHALLENGE]: {
    challengeId: number;
    endDate: Date;
  };

  [AppEventName.BRACKHIT_COMMENT_LIKE]: {
    commentId: number;
    type: BrackhitCommentTypes;
  };

  [AppEventName.CREATE_USER]: {
    userId: string;
  };

  [AppEventName.CONNECT_SPOTIFY]: {
    userId: string;
    accountType: 'premium' | 'open';
  };

  [AppEventName.USER_SENT_FRIEND_REQUEST]: {
    userId: string;
    friendId: string;
  };

  [AppEventName.USER_ACCEPTED_FRIEND_REQUEST]: {
    userId: string;
    friendId: string;
  };

  [AppEventName.CREATE_BRACKHIT]: {
    userId: string;
    brackhitId: number;
    brackhitName: string;
  };

  [AppEventName.USER_COMPLETE_BRACKHIT]: {
    userId: string;
    brackhitId: number;
    brackhitName: string;
  };

  [AppEventName.CALCULATE_BRACKHIT_RESULTS]: {
    userId: string;
    brackhitId: number;
  };

  [AppEventName.BRACKHIT_CREATOR_COMPLETIONS_NOTIFICATION]: {
    userId: string;
    brackhitId: number;
    brackhitName: string;
    completionCount: number;
  };

  [AppEventName.COMMENT_BRACKHIT]: {
    userId: string;
    brackhitId: number;
    brackhitName: string;
    ownerId: string;
    username: string;
  };

  [AppEventName.REPLY_BRACKHIT_COMMENT]: {
    userId: string;
    commentId: number;
    brackhitId: number;
    ownerId: string;
    username: string;
  };

  [AppEventName.KEEP_CONNECTION]: {
    date: Date;
  };

  [AppEventName.FETCH_USER_SPOTIFY_TOP_TRACKS]: {
    userId: string;
    campaignId: number;
  };

  [AppEventName.FETCH_USER_SPOTIFY_TOP_ARTISTS]: {
    userId: string;
    campaignId: number;
  };
}
