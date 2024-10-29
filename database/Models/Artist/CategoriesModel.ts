import { Model } from 'objection';

export class CategoriesModel extends Model {
  static get tableName() {
    return 'ean_collection.categories';
  }

  static get idColumn() {
    return 'id';
  }

  static getTableNameWithAlias(alias: string = 'c'): string {
    return CategoriesModel.tableName.concat(' as ', alias);
  }
}
