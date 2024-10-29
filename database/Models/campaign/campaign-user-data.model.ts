import { Model } from 'objection';
import { Relations } from '@database/relations/relations';
import { CampaignUserModel } from '@database/Models';

export enum DataAttributes {
  EMAIL = 'email',
  NAME = 'name',
  PHONE = 'phone',
  INSTAGRAM = 'instagram',
  ZIP = 'zip',
  COUNTRY = 'country',
  REGION = 'region',
  CITY = 'city',
}

export class CampaignUserDataModel extends Model {
  id: number;
  campaignId: number;
  campaignUserId: string;
  value: string;
  attribute: DataAttributes;
  createdAt: Date;
  updatedAt: Date;

  campaignUser?: CampaignUserModel;

  static get tableName() {
    return 'labl.campaign_user_data';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.CampaignUser]: {
        relation: Model.BelongsToOneRelation,
        modelClass: CampaignUserModel,
        join: {
          from: `${CampaignUserDataModel.tableName}.campaignUserId`,
          to: `${CampaignUserModel.tableName}.userId`,
        },
      },
    };
  }
}

export type CampaignUserDataInsert = Omit<CampaignUserDataModel, 'id' | 'createdAt' | 'updatedAt'>;
export type CampaignUserDataUpdate = Partial<CampaignUserDataInsert>;
