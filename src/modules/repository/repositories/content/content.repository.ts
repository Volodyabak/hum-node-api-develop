import { Injectable } from '@nestjs/common';
import { VimeoVideoModel, YoutubeVideoModel } from '@database/Models';

@Injectable()
export class ContentRepository {
  getYoutubeContentById(contentId: number) {
    return YoutubeVideoModel.query().findById(contentId);
  }

  getVimeoContentById(contentId: number) {
    return VimeoVideoModel.query().findById(contentId);
  }
}
