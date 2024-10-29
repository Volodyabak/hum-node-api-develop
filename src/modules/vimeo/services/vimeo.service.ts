import { Injectable, NotFoundException } from '@nestjs/common';
import axios, { Axios, AxiosError } from 'axios';
import { VimeoVideoModel } from '@database/Models';

@Injectable()
export class VimeoService {
  private client: Axios;
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.vimeo.com',
      headers: {
        Authorization: `bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
      },
    });
  }

  async getVideo(id: number) {
    return VimeoVideoModel.query().orWhere({ id: id }).orWhere({ vimeoId: id }).first();
  }

  async getVideoFromVimeo(id: number) {
    try {
      const params = { fields: 'uri,name,description,duration,created_time,pictures' };
      const response = await this.client.get(`/videos/${id}`, { params });
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError;
        if (error.response?.status === 404) {
          return null;
        }
      }
    }
  }

  async saveVideo(id: number) {
    const video = await this.getVideoFromVimeo(id);

    if (!video) {
      throw new NotFoundException(`Video not found: ${id}`);
    }

    const { name, description, created_time, pictures } = video;
    const mediumThumbnail = pictures.sizes.find((size) => size.width === 640);

    return VimeoVideoModel.query()
      .insertAndFetch({
        vimeoId: id,
        videoTitle: name,
        description: description,
        thumbnail: mediumThumbnail?.link || pictures.base_link,
        videoCreated: created_time,
      })
      .onConflict()
      .merge(['videoTitle', 'description', 'thumbnail']);
  }
}
