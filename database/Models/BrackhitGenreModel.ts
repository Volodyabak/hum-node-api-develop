import { Model } from 'objection';

export class BrackhitGenreModel extends Model {
  brackhitId;
  genreId;

  static get tableName() {
    return 'labl.brackhit_genre';
  }

  static get idColumn() {
    return ['brackhitId', 'genreId'];
  }

  static getTableNameWithAlias(alias = 'bg') {
    return `${BrackhitGenreModel.tableName} as ${alias}`;
  }

  static get callbacks() {
    return {
      joinOnBrackhitIdAndOnValGenreId(genreId: number, bgAlias = 'bg', bAlias = 'b') {
        return function () {
          this.on(`${bgAlias}.brackhitId`, `${bAlias}.brackhitId`).andOnVal(
            `${bgAlias}.genreId`,
            genreId,
          );
        };
      },
    };
  }
}
