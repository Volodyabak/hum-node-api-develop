import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { Relations } from '@database/relations/relations';
import { BallotModel } from '@database/Models';

export class CampaignBallotModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  campaignId: number;
  @ApiProperty()
  ballotId: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  ballot?: BallotModel;

  static get tableName() {
    return 'labl.campaign_ballot';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Ballot]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BallotModel,
        join: {
          from: `${CampaignBallotModel.tableName}.ballotId`,
          to: `${BallotModel.tableName}.${BallotModel.idColumn}`,
        },
      },
    };
  }
}
