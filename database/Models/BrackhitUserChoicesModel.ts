import { Model } from 'objection';
import { BrackhitModel } from './BrackhitModel';
import { BrackhitContentModel } from './Brackhit/BrackhitContentModel';
import { Relations } from '../relations/relations';
import { FromToParams } from '../../src/Tools/dto/util-classes';
import { SpotifyTrackModel } from './Spotify';

export class BrackhitUserChoicesModel extends Model {
  userId: string;
  brackhitId: number;
  roundId: number;
  choiceId: number;
  choiceTime: Date;
  createdAt: Date;
  updatedAt: Date;

  similarity: number;

  static get tableName() {
    return 'labl.brackhit_user_choices';
  }

  static get idColumn() {
    return ['userId', 'brackhitId', 'roundId'];
  }

  static getTableNameWithAlias(alias: string = 'buc'): string {
    return BrackhitUserChoicesModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      [Relations.Brackhit]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.brackhit_user_choices.brackhitId',
          to: 'labl.brackhit.brackhitId',
        },
      },

      [Relations.Content]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: 'labl.brackhit_user_choices.choiceId',
          to: 'labl.brackhit_content.choiceId',
        },
      },

      [Relations.Track]: {
        relation: Model.ManyToManyRelation,
        modelClass: SpotifyTrackModel,
        join: {
          from: 'labl.brackhit_user_choices.choiceId',
          through: {
            modelClass: BrackhitContentModel,
            from: 'labl.brackhit_content.choiceId',
            to: 'labl.brackhit_content.contentId',
          },
          to: 'ean_collection.spotify_track.id',
        },
      },
    };
  }

  static get rawSql() {
    return {
      selectChoiceSimilarityPoints(params: FromToParams) {
        return `
        (${params.from}.choice_id = ${params.to}.choice_id) as isSameChoice,
        (CASE
        WHEN ${params.from}.round_id <= 8 THEN 1
        WHEN ${params.from}.round_id <= 12 THEN 2
        WHEN ${params.from}.round_id <= 15 THEN 4
        END) as roundPoints`;
      },

      calculateSimilarity(columnName: string, alias: string) {
        return `round(sum(${alias}.roundPoints * ${alias}.isSameChoice) / sum(${alias}.roundPoints), 2) as ${columnName}`;
      },
    };
  }

  static get callbacks() {
    return {
      joinOnBrackhitIdAndOnValUserId(userId: string, bucAlias = 'buc', bAlias = 'b') {
        return function () {
          this.on(`${bucAlias}.brackhitId`, `${bAlias}.brackhitId`).andOnVal(
            `${bucAlias}.userId`,
            userId,
          );
        };
      },

      joinOnBrackhitIdAndRoundIdAndValUserId(userId: string, params: FromToParams) {
        return function () {
          this.on(`${params.from}.brackhitId`, `${params.to}.brackhitId`)
            .on(`${params.from}.roundId`, `${params.to}.roundId`)
            .andOnVal(`${params.to}.userId`, userId);
        };
      },

      joinOnBrackhitIdAndRoundIdAndChoiceId(params: FromToParams) {
        return function () {
          this.on(`${params.from}.brackhitId`, `${params.to}.brackhitId`)
            .andOn(`${params.from}.roundId`, `${params.to}.roundId`);
        };
      },
    };
  }
}
