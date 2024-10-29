import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryService } from '../../repository/services/repository.service';
import { YoutubeApi } from './youtube.api';
import { YoutubeVideoModel } from '@database/Models';
import { YoutubeClipModel } from '@database/Models/Artist/YoutubeClipModel';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';

@Injectable()
export class YoutubeService {
  constructor(
    private readonly repoService: RepositoryService,
    private readonly youtubeApi: YoutubeApi,
  ) {}

  async getVideo(id: number | string) {
    const data = typeof id === 'string' ? { youtubeKey: id } : { id };
    return YoutubeVideoModel.query().findOne(data);
  }

  async saveVideo(id: string) {
    const youtubeVideoRes = await this.youtubeApi.getVideoDetails(id);
    const [videoDetails] = youtubeVideoRes?.items || [];

    if (!videoDetails || !videoDetails.snippet || !videoDetails.status) {
      throw new NotFoundException(`Video not found: ${id}`);
    }

    const thumbnails = videoDetails.snippet.thumbnails;
    await this.repoService.brackhitRepo
      .saveYoutubeVideo({
        youtubeKey: id,
        videoTitle: videoDetails.snippet.title || '',
        videoCreated: videoDetails.snippet.publishedAt || null,
        thumbnail:
          thumbnails?.high?.url ||
          thumbnails?.medium?.url ||
          thumbnails?.standard?.url ||
          thumbnails?.default?.url ||
          '',
        isPrivate: videoDetails.status.privacyStatus === 'private' ? 1 : 0,
      })
      .onConflict()
      .merge(['videoTitle', 'thumbnail', 'isPrivate']);
    return this.getVideo(id);
  }

  async getClip(id: number | string) {
    const data = typeof id === 'string' ? { youtubeClipId: id } : { id };
    return YoutubeClipModel.query()
      .findOne(data)
      .withGraphFetched(expr([Relations.Video]));
  }

  async saveClip(clipId: string, videoId: number) {
    return YoutubeClipModel.query().insertAndFetch({
      youtubeClipId: clipId,
      youtubeVideoId: videoId,
    });
  }
}
