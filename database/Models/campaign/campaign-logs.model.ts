import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { CampaignUserAgentModel, CampaignLogActionModel } from '@database/Models';
import { ApiProperty } from '@nestjs/swagger';

export enum CampaignLogAction {
  CTA_CLICK = 'CTA_CLICK',
  SHARE_WITH_FRIEND_CLICK = 'SHARE_WITH_FRIEND_CLICK',
  SHOPPING_ITEM_CLICK = 'SHOPPING_ITEM_CLICK',
  DOWNLOAD_IOS_APP_CLICK = 'DOWNLOAD_IOS_APP_CLICK',
  DOWNLOAD_ANDROID_APP_CLICK = 'DOWNLOAD_ANDROID_APP_CLICK',
  TRY_AGAIN_CLICK = 'TRY_AGAIN_CLICK',
  SUBMIT = 'SUBMIT',
  RESUBMIT = 'RESUBMIT',
  CONTENT_PLAY = 'CONTENT_PLAY',
  START_BUTTON = 'START_BUTTON',
  SHOPPING_ITEM_ONE_CLICK = 'SHOPPING_ITEM_ONE_CLICK',
  SHOPPING_ITEM_TWO_CLICK = 'SHOPPING_ITEM_TWO_CLICK',
  SHOPPING_ITEM_THREE_CLICK = 'SHOPPING_ITEM_THREE_CLICK',
}

export class CampaignLogsModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  userAgentId: number;
  @ApiProperty()
  campaignId: number;
  @ApiProperty()
  actionId: number;
  @ApiProperty()
  url: string;
  @ApiProperty()
  slugId: number;
  @ApiProperty()
  choiceId: number;
  @ApiProperty()
  playtime: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  static get tableName() {
    return 'labl.campaign_logs';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.UserAgent]: {
        relation: Model.HasOneRelation,
        modelClass: CampaignUserAgentModel,
        join: {
          from: `${CampaignLogsModel.tableName}.userAgentId`,
          to: `${CampaignUserAgentModel.tableName}.id`,
        },
      },

      [Relations.Action]: {
        relation: Model.HasOneRelation,
        modelClass: CampaignLogActionModel,
        join: {
          from: `${CampaignLogsModel.tableName}.actionId`,
          to: `${CampaignLogActionModel.tableName}.id`,
        },
      },
    };
  }
}
