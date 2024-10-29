export const ALL_SETTINGS_ON_MSG = 'All app settings have been turned on';
export const ALL_SETTINGS_OFF_MSG = 'All app settings have been turned off';
export const INCONSISTENT_STATE_ERR_MSG =
  'Can not toggle all settings at once when app settings state is not consistent!';

export enum SettingNames {
  SHOW_ALBUM_IMAGES = 'showAlbumImages',
  ALLOW_TRACK_PREVIEWS = 'allowTrackPreviews',
}

export enum SettingTypes {
  ALBUM_IMAGES = 1,
  TRACK_PREVIEWS = 2,
}

export enum SettingStates {
  OFF = 0,
  ON = 1,
}

export const SettingTypeToNameMap = new Map([
  [SettingTypes.ALBUM_IMAGES, SettingNames.SHOW_ALBUM_IMAGES],
  [SettingTypes.TRACK_PREVIEWS, SettingNames.ALLOW_TRACK_PREVIEWS],
]);
