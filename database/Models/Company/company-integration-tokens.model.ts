import { Model } from 'objection';
import { Relations } from '@database/relations/relations';
import { IntegrationSourcesModel } from '@database/Models/Company/integration-sources.model';

export class CompanyIntegrationTokensModel extends Model {
  id: number;
  companyId: string;
  integrationId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  integrationSource?: IntegrationSourcesModel;

  static get tableName() {
    return 'labl.company_integration_tokens';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.IntegrationSource]: {
        relation: Model.BelongsToOneRelation,
        modelClass: IntegrationSourcesModel,
        join: {
          from: `${CompanyIntegrationTokensModel.tableName}.integrationId`,
          to: `${IntegrationSourcesModel.tableName}.${IntegrationSourcesModel.idColumn}`,
        },
      },
    };
  }
}
