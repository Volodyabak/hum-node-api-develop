import { Model } from 'objection';

export class TriviaQuestionPromptsModel extends Model {
  id: number;
  promptName: string;
  detail: string;
  thumbnail: string;

  static get tableName() {
    return 'labl.trivia_question_prompts';
  }

  static get idColumn() {
    return 'id';
  }
}
