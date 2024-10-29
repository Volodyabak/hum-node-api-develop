import { Model } from 'objection';
import { CategorySortingType } from '../../../src/modules/brackhits/constants/brackhits-hub.constants';

export class BrackhitCategoriesSortModel extends Model {
  id: number;
  type: CategorySortingType;
  days: number;

  static get tableName() {
    return 'labl.brackhit_categories_sort';
  }

  static get idColumn() {
    return 'id';
  }
}
