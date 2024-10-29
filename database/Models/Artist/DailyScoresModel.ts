import { Model, raw } from 'objection';

export class DailyScoresModel extends Model {
  static get tableName() {
    return 'labl.daily_scores';
  }

  static get idColumn() {
    return ['artistId', 'videoId', 'date'];
  }

  static getTableNameWithAlias(alias: string): string {
    return DailyScoresModel.tableName.concat(' as ', alias);
  }

  static get rawSql() {
    return {
      selectDailyScoreMaxDateWhereArtistIdColumn(from: string) {
        return DailyScoresModel.query()
          .max('date as date')
          .whereColumn('artistId', `${from}.id`)
          .toKnexQuery()
          .toQuery();
      },
      selectDailyScoreMaxDateWhereArtistIdVal(artistId: number) {
        return DailyScoresModel.query()
          .max('date as date')
          .where('artistId', artistId)
          .toKnexQuery()
          .toQuery();
      },
    };
  }

  static get callbacks() {
    return {
      onDailyScoreWithMaxDateAndArtistId(from: string, to: string) {
        return function () {
          this.on(
            `${to}.date`,
            raw(`(${DailyScoresModel.rawSql.selectDailyScoreMaxDateWhereArtistIdColumn(from)})`),
          ).andOn(`${to}.artistId`, `${from}.id`);
        };
      },
      onDailyScoreWithMaxDateAndArtistIdVal(artistId: number, from: string, to: string) {
        return function () {
          this.on(
            `${to}.date`,
            raw(`(${DailyScoresModel.rawSql.selectDailyScoreMaxDateWhereArtistIdVal(artistId)})`),
          ).andOn(`${to}.categoryId`, `${from}.id`);
        };
      },
    };
  }
}
