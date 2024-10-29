import { Model } from 'objection';
import { ArtistModel } from '../Artist/ArtistModel';

export class BuzzbeatRoundsModel extends Model {
  artistCount;

  static get tableName() {
    return 'labl.buzzbeat_rounds';
  }

  static get idColumn() {
    return ['buzzbeat_id', 'round_number', 'winner'];
  }

  static get relationMappings() {
    return {
      artist: {
        relation: Model.ManyToManyRelation,
        modelClass: ArtistModel,
        join: {
          from: 'labl.buzzbeat_rounds.choice_id',
          through: {
            from: 'labl.buzzbeat_content.choice_id',
            to: 'labl.buzzbeat_content.content_id',
          },
          to: 'ean_collection.artist.id',
        },
      },
    };
  }
}
