import { Model } from 'objection';
import { UserProfileInfoModel } from './User/UserProfileInfoModel';
import { BrackhitBinsModel } from './BrackhitBinsModel';

export class BrackhitUserScoreModel extends Model {
  userId: string;
  brackhitId: number;
  score: number;
  bin: number;
  createdAt: Date;
  updatedAt: Date;

  static get tableName() {
    return 'labl.brackhit_user_score';
  }

  static get idColumn() {
    return ['brackhitId', 'userId'];
  }

  static get relationMappings() {
    return {
      users: {
        relation: Model.HasOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.brackhit_user_score.userId',
          to: 'labl.user_profile_info.userId',
        },
      },
      userBin: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitBinsModel,
        join: {
          from: 'labl.brackhit_user_score.bin',
          to: 'labl.brackhit_bins.id',
        },
      },
    };
  }
}
