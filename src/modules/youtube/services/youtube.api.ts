import { Injectable } from '@nestjs/common';
import { Axios } from 'axios';
import { YoutubeVideoRes } from '../types/youtube-api.types';

@Injectable()
export class YoutubeApi {
  private readonly client = new Axios({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: {
      key: process.env.YOUTUBE_API_KEY,
    },
  });

  async getVideoDetails(videoId: string): Promise<YoutubeVideoRes> {
    const response = await this.client.get('/videos', {
      params: {
        id: videoId,
        part: 'snippet,status',
      },
    });

    return JSON.parse(response.data) as YoutubeVideoRes;
  }
}
