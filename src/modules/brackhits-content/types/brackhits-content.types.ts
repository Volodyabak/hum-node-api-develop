import { TrackInfoDto } from '../../tracks/tracks.dto';
import { TiktokModel } from '@database/Models/tiktok.model';
import { CustomContentModel } from '@database/Models/campaign/custom-content.model';
import {
  ArtistModel,
  SpotifyAlbumModel,
  VimeoVideoModel,
  YoutubeVideoModel,
} from '@database/Models';
import { YoutubeClipModel } from '@database/Models/Artist/YoutubeClipModel';

export type ContentType =
  | TrackInfoDto
  | ArtistModel
  | SpotifyAlbumModel
  | YoutubeVideoModel
  | VimeoVideoModel
  | TiktokModel
  | CustomContentModel
  | YoutubeClipModel;
