import { Injectable } from '@nestjs/common';

import { BrackhitContentType } from '../../brackhits/constants/brackhits.constants';
import { YoutubeService } from '../../youtube/services/youtube.service';
import { VimeoService } from '../../vimeo/services/vimeo.service';
import { SpotifyContentService } from '../../spotify/services/spotify-content.service';
import { formatTrackResponse } from '../utils/brackhit-content.utils';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';
import { AppSettingsService } from '../../../Services/AppSettings/AppSettingsService';
import { CustomContentService } from './custom-content.service';
import { CustomContentModel } from '@database/Models/campaign/custom-content.model';
import { TiktokService } from '../../tiktok/services/tiktok.service';
import { ContentType } from '../types/brackhits-content.types';

@Injectable()
export class BrackhitsContentService {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly vimeoService: VimeoService,
    private readonly spotifyContentService: SpotifyContentService,
    private readonly tiktokService: TiktokService,
    private readonly customContentService: CustomContentService,
  ) {}

  async getContent(contentId: number | string, type: BrackhitContentType): Promise<ContentType> {
    switch (type) {
      case BrackhitContentType.Track:
        return this.getTrack(contentId);
      case BrackhitContentType.Artist:
        return this.getArtist(contentId);
      case BrackhitContentType.Album:
        return this.getAlbum(contentId);
      case BrackhitContentType.Youtube:
        return this.getYoutubeVideo(contentId);
      case BrackhitContentType.YoutubeClip:
        return this.getYoutubeClip(contentId);
      case BrackhitContentType.Vimeo:
        return this.getVimeoVideo(contentId as number);
      case BrackhitContentType.TikTok:
        return this.getTikTokVideo(contentId);
      case BrackhitContentType.Custom:
        return this.getCustomContentById(contentId as number);
    }
  }

  async saveContent(
    contentId: number | string,
    type: BrackhitContentType,
    data?: any,
  ): Promise<ContentType> {
    switch (type) {
      case BrackhitContentType.Track:
        return this.saveTrack(contentId as string);
      case BrackhitContentType.Artist:
        return this.saveArtist(contentId as string);
      case BrackhitContentType.Album:
        return this.saveAlbum(contentId as string);
      case BrackhitContentType.Youtube:
        return this.saveYoutubeVideo(contentId as string);
      case BrackhitContentType.TikTok:
        return this.saveTikTokVideo(contentId as string);
      case BrackhitContentType.Vimeo:
        return this.saveVimeoVideo(contentId as number);
      case BrackhitContentType.YoutubeClip:
        return this.saveYoutubeClip(contentId as string, data.videoId as string);
    }
  }

  async getCustomContent(content: Partial<CustomContentModel>) {
    return this.customContentService.getContent(content);
  }

  async saveCustomContent(content: Omit<Partial<CustomContentModel>, 'id'>) {
    return this.customContentService.saveContent(content);
  }

  async getTrack(id: number | string) {
    const [track, settings] = await Promise.all([
      this.spotifyContentService
        .getTrack(id)
        .withGraphFetched(expr([Relations.Artists], [Relations.Album], [Relations.AppleTrack])),
      AppSettingsService.getAppSettingsState(),
    ]);

    if (!track || !track?.album || track?.artists?.length === 0) {
      return null;
    }

    return formatTrackResponse(track, settings);
  }

  async getArtist(id: number | string) {
    const artist = await this.spotifyContentService.getArtist(id);
    if (!artist || !artist.spotifyArtist) {
      return null;
    }
    return artist;
  }

  async getAlbum(id: number | string) {
    return this.spotifyContentService.getAlbum(id);
  }

  async getYoutubeVideo(id: number | string) {
    return this.youtubeService.getVideo(id);
  }

  async getYoutubeClip(id: number | string) {
    return this.youtubeService.getClip(id);
  }

  async getVimeoVideo(id: number) {
    return this.vimeoService.getVideo(id);
  }
  async getTikTokVideo(id: number | string) {
    return this.tiktokService.getTiktokPost(id);
  }

  async getCustomContentById(id: number) {
    return this.customContentService.getContentById(id);
  }

  private async saveTrack(id: string) {
    await this.spotifyContentService.saveTrackFromAlbum(id);
    return this.getTrack(id);
  }
  private async saveArtist(id: string) {
    return this.spotifyContentService.insertArtist(id);
  }
  private async saveAlbum(id: string) {
    return this.spotifyContentService.findOrInsertAlbum(id);
  }
  private async saveYoutubeVideo(id: string) {
    return this.youtubeService.saveVideo(id);
  }
  private async saveTikTokVideo(id: string) {
    return this.tiktokService.saveTiktokPost(id);
  }
  async saveYoutubeClip(id: string, videoId: string) {
    let youtubeVideo = await this.getYoutubeVideo(videoId);
    if (!youtubeVideo) {
      youtubeVideo = await this.saveYoutubeVideo(videoId);
    }
    const clip = await this.youtubeService.saveClip(id, youtubeVideo.id);

    return this.getYoutubeClip(clip.id);
  }
  private async saveVimeoVideo(id: number) {
    return this.vimeoService.saveVideo(id);
  }
}
