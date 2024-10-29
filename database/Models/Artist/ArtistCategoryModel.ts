import { Model, raw } from 'objection';

export class ArtistCategoryModel extends Model {
  static get tableName() {
    return 'ean_collection.artist_category';
  }

  static get idColumn() {
    return ['artistId', 'run'];
  }

  static getTableNameWithAlias(alias: string = 'ac'): string {
    return ArtistCategoryModel.tableName.concat(' as ', alias);
  }

  static get rawSql() {
    return {
      selectCategoryMaxRunWhereArtistIdColumn(from: string = 'a') {
        return ArtistCategoryModel.query()
          .max('run')
          .whereColumn('artistId', `${from}.id`)
          .toKnexQuery()
          .toQuery();
      },
      selectCategoryMaxRunWhereArtistIdVal(artistId: number) {
        return ArtistCategoryModel.query()
          .max('run')
          .where('artistId', artistId)
          .toKnexQuery()
          .toQuery();
      },
    };
  }

  static get callbacks() {
    return {
      onCategoryWithMaxRunAndArtistId(from: string, to: string) {
        return function () {
          this.on(
            `${to}.run`,
            raw(`(${ArtistCategoryModel.rawSql.selectCategoryMaxRunWhereArtistIdColumn(from)})`),
          ).andOn(`${to}.artistId`, `${from}.id`);
        };
      },
      onCategoryWithMaxRunAndArtistIdVal(artistId: number, from: string, to: string) {
        return function () {
          this.on(
            `${to}.run`,
            raw(`(${ArtistCategoryModel.rawSql.selectCategoryMaxRunWhereArtistIdVal(artistId)})`),
          ).andOn(`${to}.categoryId`, `${from}.id`);
        };
      },
    };
  }
}
