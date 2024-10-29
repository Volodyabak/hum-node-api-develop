import { Model } from 'objection';

export class BrackhitDefaultSuggestionsModel extends Model {
  id: number;
  brackhitId: number;
  suggestedBrackhitId: number;
  position: number;

  static get tableName() {
    return 'labl.brackhit_default_suggestions';
  }

  static get idColumn() {
    return 'id';
  }

  static getTableNameWithAlias(alias: string): string {
    return BrackhitDefaultSuggestionsModel.tableName.concat(' as ', alias);
  }

  static get callbacks() {
    return {
      joinOnBrackhitIdValAndSuggestedBrackhitId(brackhitId: number, from: string, to: string) {
        return function () {
          this.onVal(`${to}.brackhitId`, brackhitId).andOn(
            `${from}.brackhitId`,
            `${to}.suggestedBrackhitId`,
          );
        };
      },
    };
  }
}
