import { Model } from 'objection';

export class BallotCategoryNamesModel extends Model {
  id: number;
  categoryName: string;
  detail: string;

  static get tableName() {
    return 'labl.ballot_category_names';
  }

  static get idColumn() {
    return 'id';
  }
}
