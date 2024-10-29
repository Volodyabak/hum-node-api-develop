import { Model } from 'objection';
import { Relations } from '@database/relations/relations';
import { TriviaQuestionPromptsModel } from '@database/Models/trivia/trivia-question-prompts.model';
import { BrackhitContentTypeModel } from '@database/Models/BrackhitContentTypeModel';
import { TriviaAnswersModel } from '@database/Models/trivia/trivia-answers.model';
import { TriviaQuestionResolutionModel } from '@database/Models/trivia/trivia-question-resolution.model';

export class TriviaQuestionsModel extends Model {
  id: number;
  triviaId: number;
  roundId: number;
  typeId: number;
  questionSize: number;
  promptId: number;
  resolutionId: number;

  type: BrackhitContentTypeModel;
  prompt: TriviaQuestionPromptsModel;
  answers: TriviaAnswersModel[];
  resolution: TriviaQuestionResolutionModel;

  static get tableName() {
    return 'labl.trivia_questions';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Prompt]: {
        relation: Model.BelongsToOneRelation,
        modelClass: TriviaQuestionPromptsModel,
        join: {
          from: `${TriviaQuestionsModel.tableName}.promptId`,
          to: `${TriviaQuestionPromptsModel.tableName}.id`,
        },
      },

      [Relations.Type]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentTypeModel,
        join: {
          from: `${TriviaQuestionsModel.tableName}.typeId`,
          to: `${BrackhitContentTypeModel.tableName}.contentTypeId`,
        },
      },

      [Relations.Answers]: {
        relation: Model.HasManyRelation,
        modelClass: TriviaAnswersModel,
        join: {
          from: [
            `${TriviaQuestionsModel.tableName}.triviaId`,
            `${TriviaQuestionsModel.tableName}.roundId`,
          ],
          to: [
            `${TriviaAnswersModel.tableName}.triviaId`,
            `${TriviaAnswersModel.tableName}.roundId`,
          ],
        },
      },

      [Relations.Resolution]: {
        relation: Model.BelongsToOneRelation,
        modelClass: TriviaQuestionResolutionModel,
        join: {
          from: `${TriviaQuestionsModel.tableName}.resolutionId`,
          to: `${TriviaQuestionResolutionModel.tableName}.${TriviaQuestionResolutionModel.idColumn}`,
        },
      },
    };
  }
}
