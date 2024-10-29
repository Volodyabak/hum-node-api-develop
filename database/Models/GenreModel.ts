import { Model } from 'objection';
import { BrackhitModel } from './BrackhitModel';
import { BrackhitGenreModel } from './BrackhitGenreModel';

export class GenreModel extends Model {
  static get tableName() {
    return 'ean_collection.genre';
  }

  static get idColumn() {
    return 'genreId';
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
}
