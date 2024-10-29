import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { GenreModel } from '../GenreModel';
import { BrackhitModel } from '../BrackhitModel';

export class BrackhitFtueModel extends Model {
  brackhitId: number;
  hubId: number;
  genreName: string;

  static get tableName() {
    return 'labl.brackhit_ftue';
  }

  static get idColumn() {
    return ['brackhitId', 'hubId'];
  }

  static get relationMappings() {
    return {
      [Relations.Genre]: {
        relation: Model.HasOneRelation,
        modelClass: GenreModel,
        join: {
          from: 'labl.brackhit_ftue.hubId',
          to: 'ean_collection.genre.genreId',
        },
      },

      [Relations.Brackhit]: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.brackhit_ftue.brackhitId',
          to: 'labl.brackhit.brackhitId',
        },
      },
    };
  }
}
