import { SpotifyTrackModel } from '@database/Models';
import { TrackInfoDto } from '../tracks.dto';
import { Injectable } from '@nestjs/common';
import { HotTakeChoiceContentDto } from '../../brackhits/dto/brackhits.dto';

@Injectable()
export class TracksParser {
  parseTrackInfo(track: SpotifyTrackModel): TrackInfoDto {
    return {
      id: track.id,
      trackKey: track.trackKey,
      trackName: track.trackName,
      artists: track.artists.map((a) => a.artistName).join(', '),
      albumName: track.album?.name,
      albumImage: track.album.albumImage,
      preview: track.trackPreview || track.appleTrackPreview || null,
    };
  }

  parseHotTakeChoiceContent(track: SpotifyTrackModel): HotTakeChoiceContentDto {
    return {
      choiceId: track.choiceId,
      trackName: track.trackName,
      artists: track.artists.map((a) => a.artistName).join(', '),
      albumImage: track.album.albumImage,
    };
  }
}
