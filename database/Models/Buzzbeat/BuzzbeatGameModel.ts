import { Model } from 'objection';
import { BuzzbeatTypeModel } from './BuzzbeatTypeModel';
import { BuzzbeatRoundsModel } from './BuzzbeatRoundsModel';

export class BuzzbeatGameModel extends Model {
  id;

  static get tableName() {
    return 'labl.buzzbeat_game';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      types: {
        relation: Model.BelongsToOneRelation,
        modelClass: BuzzbeatTypeModel,
        join: {
          from: 'labl.buzzbeat_game.type_id',
          to: 'labl.buzzbeat_type.type_id',
        },
      },
      rounds: {
        relation: Model.HasManyRelation,
        modelClass: BuzzbeatRoundsModel,
        join: {
          from: 'labl.buzzbeat_game.id',
          to: 'labl.buzzbeat_rounds.buzzbeat_id',
        },
      },
    };
  }
}
