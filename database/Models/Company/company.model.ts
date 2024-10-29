import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { UserProfileInfoModel } from '../User';
import { CampaignModel } from './campaign.model';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  companyId: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  campaigns: CampaignModel[];

  static get tableName() {
    return 'labl.company';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Users]: {
        relation: Model.ManyToManyRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.company.companyId',
          through: {
            from: 'labl.user_company.companyId',
            to: 'labl.user_company.userId',
          },
          to: 'labl.user_profile_info.userId',
        },
      },

      [Relations.Campaigns]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignModel,
        join: {
          from: 'labl.company.companyId',
          to: 'labl.campaign.companyId',
        },
      },
    };
  }
}
