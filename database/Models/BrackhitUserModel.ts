import { Model } from 'objection';
import { BrackhitUserChoicesModel } from './BrackhitUserChoicesModel';
import { BrackhitModel } from './BrackhitModel';
import { UserProfileInfoModel } from './User';
import { BrackhitUserCompleteStatus } from '../../src/modules/brackhits/constants/brackhits.constants';
import { JoinParams } from '../../src/Tools/dto/util-classes';
import { QueryBuilderUtils } from '../../src/Tools/utils/query-builder.utils';

export class BrackhitUserModel extends Model {
  userId: string;
  brackhitId: number;
  isComplete: BrackhitUserCompleteStatus;
  initialCompleteTime: Date;
  createdAt: Date;
  updatedAt: Date;
  similarity: number;
  brackhit: BrackhitModel;
  count: number;
  completions: number;

  user?: UserProfileInfoModel;

  static get tableName() {
    return 'labl.brackhit_user';
  }

  static get idColumn() {
    return ['userId', 'brackhitId'];
  }

  static get relationMappings() {
    return {
      brackhit: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.brackhit_user.brackhitId',
          to: 'labl.brackhit.brackhitId',
        },
      },

      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.brackhit_user.userId',
          to: 'labl.user_profile_info.userId',
        },
      },

      choices: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitUserChoicesModel,
        join: {
          from: 'labl.brackhit_user.userId',
          to: 'labl.brackhit_user_choices.userId',
        },
      },
    };
  }

  static getTableNameWithAlias(alias: string = 'bu'): string {
    return BrackhitUserModel.tableName.concat(' as ', alias);
  }

  static get rawSql() {
    return {
      orderByIsCompleteSumDesc(alias: string) {
        return `SUM(${alias}.is_complete) DESC`;
      },
      getUserStatusOrder() {
        return `
        CASE
          WHEN bu.is_complete IS NULL THEN 0
          WHEN bu.is_complete = 0 THEN 1
          WHEN b.scoring_state != 2 THEN 2
          ELSE 3
        END
        `;
      },
      coalesceSumIsComplete(alias: string, columnName: string) {
        return `coalesce(sum(${alias}.is_complete), 0) as ${columnName}`;
      },
    };
  }

  static get callbacks() {
    return {
      joinUserCompletedBrackhit(userId: string, params: JoinParams = {}) {
        QueryBuilderUtils.setDefaultJoinParams(params, 'b', 'bu');

        return function () {
          this.on(`${params.to}.brackhitId`, `${params.from}.brackhitId`)
            .andOnVal(`${params.to}.userId`, userId)
            .andOnVal(`${params.to}.isComplete`, 1);
        };
      },

      joinOnBrackhitIdAndOnValUserId(userId: string, params: JoinParams = { to: 'bu', from: 'b' }) {
        return function () {
          this.on(`${params.to}.brackhitId`, `${params.from}.brackhitId`).andOnVal(
            `${params.to}.userId`,
            userId,
          );
        };
      },

      joinOnBrackhitIdAndOnUserId(to = 'bu', from = 'b') {
        return function () {
          this.on(`${to}.brackhitId`, `${from}.brackhitId`).andOn(`${to}.userId`, `${from}.userId`);
        };
      },

      whereIsCompleteZeroOrNull(alias: string) {
        return function () {
          this.whereRaw(`coalesce(${alias}.is_complete, 0) != 1`);
        };
      },
    };
  }
}
