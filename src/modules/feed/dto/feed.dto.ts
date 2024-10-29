import { FeedTypes } from '../constants/feed.constants';
import { FeedItemSource } from '../interfaces/feed.interfaces';

export class FeedItemArtistDto {
  id: number;
  name: string;
  image: string;
}

export class FeedItemDto {
  feedType: FeedTypes;
  timestamp: Date;
  centralId: number;
  artist: FeedItemArtistDto;
  source: FeedItemSource;
  liked: 0 | 1;
}
