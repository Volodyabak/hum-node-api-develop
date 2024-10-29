export const UserRestQueryColumns = {
  userId: 'u.sub',
  email: 'u.email',
  name: 'u.name',
  username: 'upi.username',
  firstName: 'upi.firstName',
  lastName: 'upi.lastName',
  userHometown: 'upi.userHometown',
  userBio: 'upi.userBio',
};

export const GET_USER_BRACKHITS_TAKE_DEFAULT = 25;
export const GET_USER_MUSIC_PROFILE_TAKE_DEFAULT = 5;
export const GET_USER_BY_ID_TAKE_DEFAULT = 25;
export const GET_USER_ARTISTS_TAKE_DEFAULT = 50;
export const GET_USER_SPOTIFY_TRACKS_TAKE_DEFAULT = 50;

export enum UserDeviceTypes {
  ANDROID = 'android',
  IOS = 'ios',
}
