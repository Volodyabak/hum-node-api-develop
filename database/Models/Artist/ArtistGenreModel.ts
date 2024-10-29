import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { GenreModel } from './GenreModel';

export class ArtistGenreModel extends Model {
  static get tableName() {
    return 'ean_collection.artist_genre';
  }

  static get idColumn() {
    return ['artistId'];
  }

  static get relationMappings() {
    return {
      [Relations.Genre]: {
        relation: Model.HasOneRelation,
        modelClass: GenreModel,
        join: {
          from: 'ean_collection.artist_genre.genre_id',
          to: 'ean_collection.genre.genre_id',
        },
      },
    };
  }
}
