import { Model } from 'objection';
import { Relations } from '@database/relations/relations';
import { TriviaQuestionsModel } from '@database/Models/trivia/trivia-questions.model';

export class TriviaQuestionResolutionModel extends Model {
  id: number;
  successText: string;
  failText: string;
  thumbnail: string;
  detailText: string;

  static get tableName() {
    return 'labl.trivia_question_resolution';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Question]: {
        relation: Model.HasOneRelation,
        modelClass: TriviaQuestionsModel,
        join: {
          from: `${TriviaQuestionResolutionModel.tableName}.id`,
          to: `${TriviaQuestionsModel.tableName}.resolutionId`,
        },
      },
    };
  }
}
