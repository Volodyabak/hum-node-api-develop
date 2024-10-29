import { UserCompanyRole } from '../../../src/modules/companies/inerfaces/companies.interface';
import { Relations } from '../../relations/relations';
import { Model } from 'objection';
import { UserProfileInfoModel } from '../User';
import { CompanyModel } from './company.model';

export class UserCompanyModel extends Model {
  companyId: string;
  userId: string;
  userRole: UserCompanyRole;

  user: UserProfileInfoModel;
  company: CompanyModel;

  static get tableName() {
    return 'labl.user_company';
  }

  static get idColumn() {
    return ['companyId', 'userId'];
  }

  static get relationMappings() {
    return {
      [Relations.User]: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.user_company.userId',
          to: 'labl.user_profile_info.userId',
        },
      },

      [Relations.Company]: {
        relation: Model.BelongsToOneRelation,
        modelClass: CompanyModel,
        join: {
          from: 'labl.user_company.companyId',
          to: 'labl.company.companyId',
        },
      },
    };
  }
}
