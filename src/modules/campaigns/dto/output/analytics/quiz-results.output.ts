import { ApiProperty } from '@nestjs/swagger';

export class TopAnswer {
  @ApiProperty({ description: 'The selected answer', example: 'Hawaii' })
  answer: string;

  @ApiProperty({ description: 'Number of times this answer was chosen', example: 8549 })
  timesChosen: number;

  @ApiProperty({ description: 'Whether this answer is correct', example: true })
  correct: boolean;
}

export class QuizQuestion {
  @ApiProperty({ description: 'Question number', example: 1 })
  questionNumber: number;

  @ApiProperty({
    description: 'The quiz question prompt',
    example: 'Where in the World is this GS Mini-e Koa?',
  })
  prompt: string;

  @ApiProperty({
    description: 'List of top answers for the question',
    type: [TopAnswer],
    example: [
      { answer: 'Hawaii', timesChosen: 8549, correct: true },
      { answer: 'Cancun', timesChosen: 1231, correct: false },
    ],
  })
  topAnswers: TopAnswer[];
}

export class QuizResultsOutput {
  @ApiProperty({
    description: 'Score distribution for the quiz',
    example: { 0: 1000, 1: 3000, 2: 2000, 3: 2500 },
  })
  scoreDistribution: {
    0: number;
    1: number;
    2: number;
    3: number;
  };

  @ApiProperty({
    description: 'List of questions and their respective top answers',
    type: [QuizQuestion],
    example: [
      {
        questionNumber: 1,
        prompt: 'Where in the World is this GS Mini-e Koa?',
        topAnswers: [
          { answer: 'Hawaii', timesChosen: 8549, correct: true },
          { answer: 'Cancun', timesChosen: 1231, correct: false },
        ],
      },
    ],
  })
  topAnswers: QuizQuestion[];
}
