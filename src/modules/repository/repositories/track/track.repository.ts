import { Injectable } from '@nestjs/common';
import { AppleTrackModel, SpotifyArtistModel, SpotifyTrackModel } from '@database/Models';
import { BrackhitUserChoicesModel } from '@database/Models/BrackhitUserChoicesModel';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';
import { Model, QueryBuilder, raw } from 'objection';
import { TrackInfoParams } from '../../../brackhits/interfaces/brackhits.interface';

@Injectable()
export class TrackRepository {
  getTrackById(id: number | string) {
    return SpotifyTrackModel.query()
      .alias('st')
      .orWhere({ 'st.id': id })
      .orWhere({ 'st.trackKey': id })
      .first();
  }

  // Wraps choices builder into subquery with 'sub' alias and joins track info to each choice.
  // All columns from choices builder are selected.
  // If params.excludeArtists is true, then artists won't be joined to results
  addTrackInfoToChoices<T extends Model>(choices: QueryBuilder<T, T[]>, params: TrackInfoParams) {
    const tracksInfo = BrackhitUserChoicesModel.query()
      .alias('sub')
      .select(
        'sub.*',
        'bc.contentId',
        'bc:st.trackKey',
        'bc:st.trackName',
        raw(SpotifyTrackModel.rawSql.getTrackPreview('bc:st', 'at', 'preview')),
        'bc:sat:s_al.albumImage',
      )
      .from(choices.as('sub'))
      .joinRelated(
        expr([
          Relations.Content,
          'bc',
          [Relations.Track, 'st'],
          [Relations.AlbumTrack, 'sat', [Relations.Album, 's_al']],
        ]),
      )
      .leftJoin(
        AppleTrackModel.tableNameWithAlias('at'),
        AppleTrackModel.callbacks.joinOnIsrc('bc:st', 'at'),
      );

    if (!params.excludeArtists) {
      tracksInfo
        .select(raw(SpotifyArtistModel.rawSql.getCommaSeparatedArtistNames('sa', 'artists')))
        .join(SpotifyArtistModel.tableNameWithAlias('sa'), 'bc:sat.spotifyArtistId', 'sa.id');
    }

    if (params.groupByRound) {
      tracksInfo.groupBy('sub.roundId');
    } else {
      tracksInfo.groupBy('sub.choiceId');
    }

    return tracksInfo;
  }
}
