import { Model } from 'objection';

export class BrackhitTagModel extends Model {
  brackhitId: number;
  tagId: number;

  static get tableName() {
    return 'labl.brackhit_tag';
  }

  static get idColumn() {
    return ['brackhitId', 'tagId'];
  }

  static getTableNameWithAlias(alias = 'bt') {
    return `${BrackhitTagModel.tableName} as ${alias}`;
  }

  static get callbacks() {
    return {
      joinOnBrackhitIdAndOnValTagId(tagId: number, btAlias = 'bt', bAlias = 'b') {
        return function () {
          this.on(`${btAlias}.brackhitId`, `${bAlias}.brackhitId`).andOnVal(
            `${btAlias}.tagId`,
            tagId,
          );
        };
      },
    };
  }
}
