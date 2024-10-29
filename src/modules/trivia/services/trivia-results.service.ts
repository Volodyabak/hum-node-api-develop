import { Injectable } from '@nestjs/common';
import { SingleChoiceRound } from '../../campaigns/dto';
import { TriviaServiceV2 } from './trivia.service.v2';

@Injectable()
export class TriviaResultsService {
  constructor(private readonly triviaService: TriviaServiceV2) {}

  async calculateTriviaScore(id: string, answers: SingleChoiceRound[]): Promise<number> {
    const correctChoices = new Set();
    const trivia = await this.triviaService.findById(id);

    trivia.rounds.forEach((round) => {
      round.question.resolve.choiceIds.forEach((choiceId) => correctChoices.add(choiceId));
    });

    return answers.reduce((acc, answer) => {
      const points = correctChoices.has(answer.choiceId) ? 1 : 0;
      return acc + points;
    }, 0);
  }
}
