import { Model } from 'objection';
import { Relations } from '@database/relations/relations';
import { TriviaQuestionsModel } from '@database/Models/trivia/trivia-questions.model';

export class TriviaModel extends Model {
  id: number;
  triviaName: string;
  detail: string;
  ownerId: string;
  thumbnail: string;
  questionCount: number;
  hiddenInApp: number;
  createdAt: Date;
  updatedAt: Date;

  questions: TriviaQuestionsModel[];

  static get tableName() {
    return 'labl.trivia';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Questions]: {
        relation: Model.HasManyRelation,
        modelClass: TriviaQuestionsModel,
        join: {
          from: `${TriviaModel.tableName}.id`,
          to: `${TriviaQuestionsModel.tableName}.triviaId`,
        },
      },
    };
  }
}
