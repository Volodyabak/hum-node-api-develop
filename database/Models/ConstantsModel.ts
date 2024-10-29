import { Model } from 'objection';
import { BrackhitModel } from './BrackhitModel';
import { BrackhitGenreModel } from './BrackhitGenreModel';
import { ConstantId } from '../../src/modules/constants/constants';

export class ConstantsModel extends Model {
  id: ConstantId;
  value: number;
  detail: string;
  description: string;

  static get tableName() {
    return 'labl.constants';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      brackhits: {
        relation: Model.ManyToManyRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'ean_collection.genre.genreId',
          through: {
            modelClass: BrackhitGenreModel,
            from: 'labl.brackhit_genre.genreId',
            to: 'labl.brackhit_genre.brackhitId',
          },
          to: 'labl.brackhit.brackhitId',
        },
      },
    };
  }

  async $afterFind() {
    this.description = this.detail;
  }

  async $beforeInsert() {
    if (this.description) {
      this.detail = this.description;
    }
    this.description = undefined;
  }

  async $beforeUpdate() {
    if (this.description) {
      this.detail = this.description;
    }
    this.description = undefined;
  }
}
