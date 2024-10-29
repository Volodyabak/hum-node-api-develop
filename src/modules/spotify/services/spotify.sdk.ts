import { Injectable, Logger } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';

import { spotifyWebApiConfig } from '../configs/spotify.config';
import { SPOTIFY_AUTH_URL, SPOTIFY_PLAYLIST_BASE_URL } from '../constants';
import { ISpotifySdk, SpotifySdkAuthResponse } from '../interfaces/spotify.interfaces';
import { SpotifyCodeExchangeResponseDto } from '../dto/spotify-api.dto';
import { toCamelCase } from '../../../Tools/utils/utils';

@Injectable()
export class SpotifySdk implements ISpotifySdk {
  private readonly _logger = new Logger(SpotifySdk.name);
  private _client = new SpotifyWebApi(spotifyWebApiConfig);
  private _expiresIn = Date.now();

  async getTrack(trackId: string): Promise<SpotifyApi.SingleTrackResponse> {
    await this.authenticate();
    const response = await this._client.getTrack(trackId);
    this.checkResponse(response);
    return response.body;
  }

  async getArtist(artistId: string): Promise<SpotifyApi.SingleArtistResponse> {
    await this.authenticate();
    const response = await this._client.getArtist(artistId);
    await this.checkResponse(response);
    return response.body;
  }

  getPlaylistId(playlistLink: string): string {
    return playlistLink.replace(SPOTIFY_PLAYLIST_BASE_URL, '').split('?')[0];
  }

  async getPlaylist(playlistId: string): Promise<SpotifyApi.SinglePlaylistResponse> {
    await this.authenticate();
    const response = await this._client.getPlaylist(playlistId);
    await this.checkResponse(response);
    return response.body;
  }

  async getPlaylistTracks(
    playlistId: string,
    offset: number,
    limit: number,
  ): Promise<SpotifyApi.PlaylistTrackResponse> {
    await this.authenticate();
    const response = await this._client.getPlaylistTracks(playlistId, {
      offset,
      limit,
    });
    await this.checkResponse(response);
    return response.body;
  }

  async getAlbum(albumId: string): Promise<SpotifyApi.SingleAlbumResponse> {
    await this.authenticate();
    const response = await this._client.getAlbum(albumId);
    this.checkResponse(response);
    return response.body;
  }

  async exchangeCode(code: string, redirectUri?: string): Promise<SpotifyCodeExchangeResponseDto> {
    try {
      if (redirectUri) {
        this._client.setRedirectURI(redirectUri);
      }
      const response = await this._client.authorizationCodeGrant(code);
      return toCamelCase(response.body) as SpotifyCodeExchangeResponseDto;
    } catch (err) {
      this._logger.error(err);
      throw new Error(err);
    }
  }

  async getMe(): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    try {
      const response = await this._client.getMe();
      return response.body;
    } catch (err) {
      this._logger.error(err);
      throw new Error(err);
    }
  }

  setAccessToken(accessToken: string) {
    this._client.setAccessToken(accessToken);
  }

  private async authenticate(): Promise<void> {
    if (this._expiresIn < Date.now()) {
      const { clientId, clientSecret } = spotifyWebApiConfig;
      const token = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: token,
      };
      const data = new URLSearchParams([['grant_type', 'client_credentials']]);

      const response = await axios.post<SpotifySdkAuthResponse>(SPOTIFY_AUTH_URL, data, {
        headers,
      });

      this._expiresIn = response.data.expires_in;
      this._client.setAccessToken(response.data.access_token);
    }
  }

  private checkResponse(response: { statusCode: number; body: unknown }) {
    if (response.statusCode !== 200) {
      this._logger.error(response.body);
      throw new Error(response.body.toString());
    }
  }

  async getTopTracks(options: {
    limit?: number;
    offset?: number;
    time_range?: 'short_term' | 'medium_term' | 'long_term';
  }) {
    const response = await this._client.getMyTopTracks(options);
    return response.body;
  }

  async getTopArtists(options: {
    limit?: number;
    offset?: number;
    time_range?: 'short_term' | 'medium_term' | 'long_term';
  }) {
    const response = await this._client.getMyTopArtists(options);
    return response.body;
  }
}
