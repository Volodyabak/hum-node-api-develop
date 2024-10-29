import { Model } from 'objection';
import { ContentType } from '../../../src/modules/brackhits-content/types/brackhits-content.types';
import { Relations } from '@database/relations/relations';
import { BrackhitContentModel } from '@database/Models';

export class TriviaAnswersModel extends Model {
  id: number;
  triviaId: number;
  roundId: number;
  choiceId: number;
  isCorrect: 0 | 1;

  content: ContentType;
  choiceContent: BrackhitContentModel;

  static get tableName() {
    return 'labl.trivia_answers';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.ChoiceContent]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: `${this.tableName}.choiceId`,
          to: `${BrackhitContentModel.tableName}.choiceId`,
        },
      },
    };
  }
}
