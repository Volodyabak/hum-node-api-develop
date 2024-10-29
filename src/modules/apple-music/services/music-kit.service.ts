import { Injectable, Scope } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import axios, { Axios } from 'axios';

import { AppleMusicConfig } from '../configs/apple-music.config';
import { RecentlyPlayedTracksResponse, Song } from '../interfaces/music-kit.interface';

const MUSIC_KIT_API_URL = 'https://api.music.apple.com';

@Injectable({ scope: Scope.REQUEST })
export class MusicKitService {
  private readonly client: Axios;

  constructor() {
    this.client = axios.create({
      baseURL: MUSIC_KIT_API_URL,
      headers: {
        Authorization: `Bearer ${this.generateDeveloperToken()}`,
      },
    });
  }

  async getRecentlyPlayedTracks(): Promise<Song[]> {
    try {
      const path = '/v1/me/recent/played/tracks';
      const { data } = await this.client.get<RecentlyPlayedTracksResponse>(path);

      return data.data;
    } catch (err) {
      const errors = err.response.data?.errors?.map((error) => error?.detail)?.join('; ');
      console.error(JSON.stringify(err.response.data));
      throw new Error(errors);
    }
  }

  public setMusicUserToken(userMusicToken: string) {
    this.client.defaults.headers['Music-User-Token'] = userMusicToken;
  }

  private generateDeveloperToken(): string {
    return sign({}, AppleMusicConfig.secret, {
      header: {
        alg: 'ES256',
        kid: AppleMusicConfig.keyId,
      },
      algorithm: 'ES256',
      expiresIn: '180d',
      issuer: AppleMusicConfig.teamId,
    });
  }
}
