import { Model } from 'objection';

export class GenreModel extends Model {
  genreId: number;
  genreName: string;
  topGenre: number;
  genreParent: number;

  static get tableName() {
    return 'ean_collection.genre';
  }

  static get idColumn() {
    return 'genre_id';
  }
}
