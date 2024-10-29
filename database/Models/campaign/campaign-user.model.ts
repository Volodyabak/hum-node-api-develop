import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { CampaignUserBallotModel, CampaignUserBrackhitModel } from '@database/Models';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignUserDataModel } from '@database/Models/campaign/campaign-user-data.model';

export class CampaignUserModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  instagramUsername: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  zipCode: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  campaignUserBallot?: CampaignUserBallotModel[];
  data?: CampaignUserDataModel[];

  static get tableName() {
    return 'labl.campaign_user';
  }

  static get idColumn() {
    return 'userId';
  }

  static get relationMappings() {
    return {
      [Relations.BrackhitUser]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignUserBrackhitModel,
        join: {
          from: `${CampaignUserModel.tableName}.userId`,
          to: `${CampaignUserBrackhitModel.tableName}.campaignUserId`,
        },
      },

      [Relations.CampaignUserBallot]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignUserBallotModel,
        join: {
          from: `${CampaignUserModel.tableName}.userId`,
          to: `${CampaignUserBallotModel.tableName}.campaignUserId`,
        },
      },

      [Relations.Data]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignUserDataModel,
        join: {
          from: `${CampaignUserModel.tableName}.userId`,
          to: `${CampaignUserDataModel.tableName}.campaignUserId`,
        },
      },
    };
  }
}
