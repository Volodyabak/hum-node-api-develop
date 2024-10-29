import {
  ArtistFeedTestModel,
  NewsFeedItemModel,
  NewsFeedModel,
  SpotifyAlbumModel,
  YoutubeVideoModel,
} from '../../../../database/Models';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { PartialModelObject } from 'objection';

export type ArtistoryNewsFeedItem = ArtistFeedTestModel & NewsFeedModel & NewsFeedItemModel;
export type FeedItemSource =
  | SpotifyAlbumModel
  | PartialModelObject<NewsFeedItemModel>
  | YoutubeVideoModel
  | BrackhitModel;
