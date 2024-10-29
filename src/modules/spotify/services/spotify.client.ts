import { Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { GetUserPlaylistsParams } from '../interfaces/spotify-user.interface';
import { spotifyWebApiConfig } from '../configs/spotify.config';
import { SpotifyRefreshTokenBody } from '../interfaces/spotify.interfaces';

@Injectable()
export class SpotifyClient {
  private _client: SpotifyWebApi;

  constructor() {
    this._client = new SpotifyWebApi();
  }

  // Returns public profile information about a Spotify user
  async getMe(token: string): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    this._client.setAccessToken(token);
    const response = await this._client.getMe();
    return response.body;
  }

  // Returns a list of the playlists owned or followed by a Spotify user
  async getUserPlaylists(
    spotifyUserId: string,
    params: GetUserPlaylistsParams,
  ): Promise<SpotifyApi.ListOfUsersPlaylistsResponse> {
    this._client.setAccessToken(params.accessToken);
    const response = await this._client.getUserPlaylists(spotifyUserId, params);
    return response.body;
  }

  // Returns new access token (also may return new refresh token)
  async refreshAccessToken(refreshToken: string): Promise<SpotifyRefreshTokenBody> {
    this._client.setClientId(spotifyWebApiConfig.clientId);
    this._client.setClientSecret(spotifyWebApiConfig.clientSecret);
    this._client.setRefreshToken(refreshToken);

    const response = await this._client.refreshAccessToken();
    return { ...response.body };
  }
}
