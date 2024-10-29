import { Model } from 'objection';
import { S3Service } from '../../../src/modules/aws/services/s3.service';
import { ApiProperty } from '@nestjs/swagger';
import { CAMPAIGN_TYPE_ID } from '../../../src/modules/campaigns/constants/campaign.constants';
import { Relations } from '@database/relations/relations';
import { CampaignBallotModel, CampaignBrackhitModel, CampaignSlugModel } from '@database/Models';

const s3Service = new S3Service();

export class CampaignModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  typeId: CAMPAIGN_TYPE_ID;
  @ApiProperty()
  name: string;
  @ApiProperty()
  publicName: string;
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  data: Record<string, any>;
  @ApiProperty()
  dataKey: string;
  @ApiProperty()
  link: string;
  @ApiProperty()
  termLink: string;
  @ApiProperty()
  redirectUrl: string;
  @ApiProperty()
  userDetailsPlacement: 0 | 1;
  @ApiProperty()
  companyId: string;
  @ApiProperty()
  recaptcha: number;
  @ApiProperty()
  spotifyAuth: 0 | 1;
  @ApiProperty()
  useCustomNames: 0 | 1;
  @ApiProperty()
  campaignStarttime: Date;
  @ApiProperty()
  campaignEndtime: Date;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  campaignBrackhits: CampaignBrackhitModel[];
  campaignBallots: CampaignBallotModel[];

  static get tableName() {
    return 'labl.campaign';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Slugs]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignSlugModel,
        join: {
          from: `${CampaignModel.tableName}.${CampaignModel.idColumn}`,
          to: `${CampaignSlugModel.tableName}.campaignId`,
        },
      },

      [Relations.CampaignBrackhits]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignBrackhitModel,
        join: {
          from: `${CampaignModel.tableName}.${CampaignModel.idColumn}`,
          to: `${CampaignBrackhitModel.tableName}.campaignId`,
        },
      },

      [Relations.CampaignBallots]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignBallotModel,
        join: {
          from: `${CampaignModel.tableName}.${CampaignModel.idColumn}`,
          to: `${CampaignBallotModel.tableName}.campaignId`,
        },
      },
    };
  }

  async $afterFind() {
    if (this.dataKey) {
      try {
        const data = await s3Service.getObject(this.dataKey);
        this.data = JSON.parse(data.Body.toString());
      } catch (err) {
        this.data = {};
      }
    }
  }
}
