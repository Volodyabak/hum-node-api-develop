import { Model } from 'objection';

export class IntegrationSourcesModel extends Model {
  id: number;
  integrationName: string;

  static get tableName() {
    return 'labl.integration_sources';
  }

  static get idColumn() {
    return 'id';
  }
}
