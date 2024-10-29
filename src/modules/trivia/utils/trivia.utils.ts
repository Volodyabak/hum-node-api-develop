import { TriviaModel } from '@database/Models/trivia/trivia.model';
import { formatContentResponse } from '../../ballots/utils/ballot-response.util';

export function formatGetTriviaResponse(trivia: TriviaModel) {
  return {
    id: trivia.id,
    name: trivia.triviaName,
    description: trivia.detail,
    ownerId: trivia.ownerId,
    thumbnail: trivia.thumbnail,
    questionCount: trivia.questionCount,
    questions: trivia.questions.map((question) => ({
      type: question.type.contentType,
      roundId: question.roundId,
      questionSize: question.questionSize,
      prompt: question.prompt.promptName,
      description: question.prompt.detail,
      thumbnail: question.prompt.thumbnail,
      choices: question.answers.map((answer) =>
        formatContentResponse(question.type.contentType, {
          choiceId: answer.choiceId,
          content: answer.content,
        }),
      ),
      resolve: {
        choiceIds: question.answers
          .filter((answer) => answer.isCorrect)
          .map((answer) => answer.choiceId),
        feedback: question.resolution,
      },
    })),
    createdAt: trivia.createdAt,
    updatedAt: trivia.updatedAt,
  };
}
