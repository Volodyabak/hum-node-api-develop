import { Injectable } from '@nestjs/common';
import { HotTakesParams } from '../tracks.dto';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import { Relations } from '@database/relations/relations';
import { DEFAULT_ALBUM_IMAGE } from '../../../constants';
import { TracksParser } from '../utils/tracks.parser';
import { expr } from '@database/relations/relation-builder';
import { SpotifyTrackModel } from '@database/Models';
import { HotTakeChoiceContentDto } from '../../brackhits/dto/brackhits.dto';

@Injectable()
export class TracksService {
  constructor(private readonly tracksParser: TracksParser) {}

  async getHotTakeChoiceContent(
    choiceId: number,
    params: HotTakesParams,
  ): Promise<HotTakeChoiceContentDto> {
    const trackQB = SpotifyTrackModel.query()
      .alias('st')
      .select('bc.choiceId', 'st.trackName')
      .joinRelated(expr([Relations.Content, 'bc']))
      .where('bc.choiceId', choiceId)
      .first();

    QueryBuilderUtils.fetchRelationsToBuilder(trackQB, [
      {
        relation: Relations.Artists,
        select: ['artistName'],
      },
      {
        relation: Relations.Album,
        select: ['albumImage'],
      },
    ]);

    const track = await trackQB;

    if (!params.settings.showAlbumImages) {
      track.album.albumImage = DEFAULT_ALBUM_IMAGE;
    }

    return this.tracksParser.parseHotTakeChoiceContent(track);
  }
}
