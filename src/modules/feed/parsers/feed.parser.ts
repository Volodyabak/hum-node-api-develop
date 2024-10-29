import { ArtistoryNewsFeedItem } from '../interfaces/feed.interfaces';
import { FeedItemDto } from '../dto/feed.dto';

export class FeedParser {
  static parseArtistoryNewsItem(el: ArtistoryNewsFeedItem): FeedItemDto {
    return {
      feedType: 4,
      timestamp: el.timestamp,
      centralId: el.centralId,
      artist: {
        id: null,
        name: el.feedSource,
        image: el.feedIcon,
      },
      source: {
        title: el.title,
        link: el.link,
        description: el.description,
        image: el.image,
      },
      liked: 0,
    };
  }
}
