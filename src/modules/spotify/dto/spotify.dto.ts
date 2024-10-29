import { ApiProperty } from '@nestjs/swagger';
import {
  DATE_EXAMPLE,
  MODEL_ID,
  SPOTIFY_ALBUM_KEY,
  SPOTIFY_ARTIST_KEY,
  SPOTIFY_TRACK_KEY,
  TRACK_ALBUM_IMAGE,
  TRACK_PREVIEW,
} from '../../../api-model-examples';
import { ISRC_EXAMPLE, SpotifyPlaylistValidationMessage } from '../constants';

export class SpotifyUserPlaylistsDto {
  @ApiProperty({})
  key: string;
  @ApiProperty()
  name: string;
  @ApiProperty({})
  image: string;
  @ApiProperty()
  totalTracks: number;
  @ApiProperty()
  isAllowed?: 0 | 1 | undefined;
  @ApiProperty()
  message?: SpotifyPlaylistValidationMessage | undefined;
}

export class SpotifyArtistDto {
  @ApiProperty({ example: SPOTIFY_ARTIST_KEY })
  artistKey: string;
  @ApiProperty()
  artistName: string;
}

export class SpotifyAlbumDto {
  @ApiProperty({ example: SPOTIFY_ALBUM_KEY })
  albumKey: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: TRACK_ALBUM_IMAGE })
  albumImage: string;
  @ApiProperty()
  albumType: string;
  @ApiProperty({ example: DATE_EXAMPLE })
  releaseDate: Date;
  @ApiProperty()
  releaseDatePrecision: string;
  @ApiProperty({ type: [SpotifyArtistDto] })
  artists: SpotifyArtistDto[];
}

export class SpotifyTrackDto {
  @ApiProperty({ example: SPOTIFY_TRACK_KEY })
  trackKey: string;
  @ApiProperty()
  trackName: string;
  @ApiProperty({ example: TRACK_PREVIEW })
  trackPreview: string;
  @ApiProperty({ example: ISRC_EXAMPLE })
  isrc: string;
  @ApiProperty()
  popularity: number;
  @ApiProperty({ type: SpotifyAlbumDto })
  album: SpotifyAlbumDto;
  @ApiProperty({ isArray: true, type: SpotifyArtistDto })
  artists: SpotifyArtistDto[];
}

export class PlaylistImageDto {
  @ApiProperty()
  url: string;
  @ApiProperty()
  key: string;
}

export class PlaylistDto {
  @ApiProperty()
  playlistKey: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ type: PlaylistImageDto })
  image: PlaylistImageDto;
}

export class PlaylistTrackDto {
  @ApiProperty({ example: MODEL_ID })
  id: number;
  @ApiProperty({ example: SPOTIFY_TRACK_KEY })
  trackKey: string;
  @ApiProperty()
  trackName: string;
  @ApiProperty({ example: TRACK_PREVIEW })
  trackPreview: string;
  @ApiProperty()
  trackUri: string;
  @ApiProperty({ example: ISRC_EXAMPLE })
  isrc: string;
  @ApiProperty()
  popularity: number;
  @ApiProperty({ example: DATE_EXAMPLE })
  lastChecked: Date;
  @ApiProperty({ example: TRACK_ALBUM_IMAGE })
  albumImage: string;
}
