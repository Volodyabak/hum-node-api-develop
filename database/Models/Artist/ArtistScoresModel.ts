import { Model, raw } from 'objection';

export class ArtistScoresModel extends Model {
  artistId: number;
  run: number;
  score: number;

  static get tableName() {
    return 'ean_collection.artiscores';
  }

  static get idColumn() {
    return ['artistId', 'run'];
  }

  static getTableNameWithAlias(alias: string = 'asr') {
    return ArtistScoresModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {};
  }

  static get callbacks() {
    return {
      joinOnArtistIdAndMaxRun(idColumn: string, from: string, to: string) {
        return function () {
          this.on(`${from}.${idColumn}`, `${to}.artistId`).andOn(
            `${to}.run`,
            raw(`(${ArtistScoresModel.rawSql.getArtistScoresMaxRun()})`),
          );
        };
      },
    };
  }

  static get rawSql() {
    return {
      getArtistScoresMaxRun() {
        return ArtistScoresModel.query().max('run').toKnexQuery().toQuery();
      },
    };
  }
}
