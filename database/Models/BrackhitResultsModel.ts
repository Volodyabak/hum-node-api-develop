import { Model } from 'objection';
import { BrackhitModel } from './BrackhitModel';
import { BrackhitContentModel } from './Brackhit/BrackhitContentModel';
import { Relations } from '../relations/relations';
import { TrackInfoDto } from '../../src/modules/tracks/tracks.dto';

export class BrackhitResultsModel extends Model {
  brackhitId: number;
  name: string;
  roundId: number;
  choiceId: number;
  winner: number;
  votes: number;

  contentId?: number;
  content?: TrackInfoDto;
  choice?: BrackhitContentModel;

  static get tableName() {
    return 'labl.brackhit_results';
  }

  static get idColumn() {
    return ['brackhitId', 'roundId', 'choiceId'];
  }

  static getTableNameWithAlias(alias: string = 'br'): string {
    return BrackhitResultsModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      [Relations.Brackhit]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.brackhit_results.brackhitId',
          to: 'labl.brackhit.brackhitId',
        },
      },

      [Relations.Choice]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: 'labl.brackhit_results.choiceId',
          to: 'labl.brackhit_content.choiceId',
        },
      },
    };
  }
}
