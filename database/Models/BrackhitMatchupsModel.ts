import { Model } from 'objection';

import { BrackhitModel } from './BrackhitModel';
import { BrackhitContentModel } from './Brackhit/BrackhitContentModel';
import { Relations } from '../relations/relations';
import { JoinParams } from '../../src/Tools/dto/util-classes';
import { QueryBuilderUtils } from '../../src/Tools/utils/query-builder.utils';
import { CampaignBrackhitUserChoiceModel } from './campaign';

export class BrackhitMatchupsModel extends Model {
  brackhitId: number;
  seed: number;
  roundId: number;
  choiceId: number;

  brackhitContent: BrackhitContentModel;
  count?: number;
  votes?: number;
  percent?: number;

  static get tableName() {
    return 'labl.brackhit_matchups';
  }

  static get idColumn() {
    return ['brackhitId', 'seed', 'roundId'];
  }

  static getTableNameWithAlias(alias: string = 'bm'): string {
    return BrackhitMatchupsModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      [Relations.Brackhit]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.brackhit_matchups.brackhitId',
          to: 'labl.brackhit.brackhitId',
        },
      },

      [Relations.BrackhitContent]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: 'labl.brackhit_matchups.choiceId',
          to: 'labl.brackhit_content.choiceId',
        },
      },

      [Relations.CampaignChoices]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignBrackhitUserChoiceModel,
        join: {
          from: ['labl.brackhit_matchups.brackhitId', 'labl.brackhit_matchups.choiceId'],
          to: [
            'labl.campaign_brackhit_user_choice.brackhitId',
            'labl.campaign_brackhit_user_choice.choiceId',
          ],
        },
      },
    };
  }

  static get callbacks() {
    return {
      joinOnChoiceIdAndBrackhitIdVal(brackhitId: number, params: JoinParams = {}) {
        QueryBuilderUtils.setDefaultJoinParams(params, 'br', 'bm');

        return function () {
          this.on(`${params.to}.choiceId`, `${params.from}.choiceId`).andOnVal(
            `${params.to}.brackhitId`,
            brackhitId,
          );
        };
      },
    };
  }

  static get rawSql() {
    return {
      selectNextRound(name: string, from: string, to: string) {
        return `CASE
        WHEN ${to}.round_id IS NULL THEN ${from}.round_id
        WHEN ${to}.round_id IN (1, 2) THEN 9
        WHEN ${to}.round_id IN (3, 4) THEN 10
        WHEN ${to}.round_id IN (5, 6) THEN 11
        WHEN ${to}.round_id IN (7, 8) THEN 12
        WHEN ${to}.round_id IN (9, 10) THEN 13
        WHEN ${to}.round_id IN (11, 12) THEN 14
        WHEN ${to}.round_id IN (13, 14) THEN 15
        ELSE 16
        END as ${name}`;
      },
    };
  }
}
