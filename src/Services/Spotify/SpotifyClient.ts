import SpotifyWebApi from 'spotify-web-api-node';

export const enum TimeRange {
  SHORT_TERM = 'short_term',
  MEDIUM_TERM = 'medium_term',
  LONG_TERM = 'long_term',
}

class SpotifyClient {
  private _client: SpotifyWebApi;

  constructor() {
    this._client = new SpotifyWebApi();
  }

  async getMyTopArtists(
    token: string,
    time_range: TimeRange,
    limit: number,
  ): Promise<SpotifyApi.UsersTopArtistsResponse> {
    try {
      this._client.setAccessToken(token);
      const { body } = await this._client.getMyTopArtists({ time_range, limit });
      return body;
    } catch (err) {
      console.error('SpotifyClient Error:::', err.body);
      throw err;
    }
  }

  async getFollowedArtists(
    token: string,
    limit: number,
  ): Promise<SpotifyApi.UsersFollowedArtistsResponse> {
    this._client.setAccessToken(token);
    try {
      const { body } = await this._client.getFollowedArtists({ limit });
      return body;
    } catch (err) {
      console.error('SpotifyClient Error:::', err.body);
      throw err;
    }
  }
}

const SpotifyClientInstance = new SpotifyClient();
export { SpotifyClientInstance as SpotifyClient };
