import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { BallotVotingTypeModel } from './ballot-voting-type.model';
import { BallotCategoriesModel } from './ballot-categories.model';
import { UserProfileInfoModel } from '../User';
import { CampaignBallotModel } from './campaign-ballot.model';
import { CampaignModel } from '../Company/campaign.model';

export class BallotModel extends Model {
  id: number;
  ballotName: string;
  detail: string;
  ownerId: string;
  thumbnail: string;
  categoryCount: number;
  votingTypeId: number;
  createdAt: Date;
  updatedAt: Date;

  owner?: UserProfileInfoModel;
  votingType?: BallotVotingTypeModel;
  categories?: BallotCategoriesModel[];
  campaigns?: CampaignModel[];

  static get tableName() {
    return 'labl.ballot';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Owner]: {
        relation: Model.HasOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.ballot.ownerId',
          to: 'labl.user_profile_info.userId',
        },
      },

      [Relations.VotingType]: {
        relation: Model.HasOneRelation,
        modelClass: BallotVotingTypeModel,
        join: {
          from: `${this.tableName}.${this.idColumn}`,
          to: `${BallotVotingTypeModel.tableName}.${BallotVotingTypeModel.idColumn}`,
        },
      },

      [Relations.Categories]: {
        relation: Model.HasManyRelation,
        modelClass: BallotCategoriesModel,
        join: {
          from: `${this.tableName}.${this.idColumn}`,
          to: `${BallotCategoriesModel.tableName}.ballotId`,
        },
      },

      [Relations.Campaigns]: {
        relation: Model.ManyToManyRelation,
        modelClass: CampaignModel,
        join: {
          from: `${this.tableName}.${this.idColumn}`,
          through: {
            modelClass: CampaignBallotModel,
            from: `${CampaignBallotModel.tableName}.ballotId`,
            to: `${CampaignBallotModel.tableName}.campaignId`,
          },
          to: `${CampaignModel.tableName}.${CampaignModel.idColumn}`,
        },
      },
    };
  }
}
