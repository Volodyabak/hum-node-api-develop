export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';
export const SPOTIFY_PLAYLIST_BASE_URL = 'https://open.spotify.com/playlist/';
export const SPOTIFY_PLAYLIST_LINK = `${SPOTIFY_PLAYLIST_BASE_URL}5rG7otWbsEw6JXz6BphgFI?si=aa98b22a194345df`;
export const PLAYLIST_SIZE = 16;
export const MIN_PLAYLIST_SIZE = 2;
export const MAX_PLAYLIST_SIZE = 64;
export const PLAYLIST_DEFAULT_IMAGE_KEY = 'default/albumDefault.png';
export const PLAYLIST_IMAGE = 'https://i.scdn.co/image/ab67706f00000003d45924b0c5bf77a474e7be2a';
export const PLAYLIST_KEY = '37i9dQZF1DX4pUKG1kS0Ac';
export const ISRC_EXAMPLE = 'USSM11300080';

export const GET_USER_SPOTIFY_PLAYLISTS_MAX_LIMIT = 50;
export const GET_USER_PLAYLISTS_PREVIEW_COUNT = 5;

export const SPOTIFY_OWNER = 'spotify';

export enum SpotifyKeywords {
  YOUR_TOP_SONGS = 'Your Top Songs',
}

export enum StreamingService {
  SPOTIFY = 'spotify',
  APPLE_MUSIC = 'apple-music',
  NONE = 'none',
}

export enum SpotifyAccountType {
  PREMIUM = 'premium',
  FREE = 'free',
  OPEN = 'open',
}

export enum SpotifyPlaylistSort {
  HEAD = 'head',
  POPULARITY = 'popularity',
}

export enum SpotifyPlaylistValidationMessage {
  NOT_ENOUGH_TRACKS = 'not enough tracks',
  WRAPPED_PLAYLIST_NOT_ALLOWED = 'wrapped playlist not allowed',
}
