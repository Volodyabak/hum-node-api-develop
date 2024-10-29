export const COMPARE_FRIENDS_GENRES_TAKE = 5;
export const FRIENDS_COMPATIBILITY_BRACKHITS_TAKE = 6;

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DENIED = 'denied',
}

export enum UserRelationship {
  SELF = 'self',
  NONE = 'none',
  FRIEND = 'friend',
  RESPOND = 'respond',
  REQUESTED = 'requested',
}

export enum UserBadgeSection {
  SHARED = 'shared',
  USER = 'user',
  FRIEND = 'friend',
}
