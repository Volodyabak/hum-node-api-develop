import { BrackhitContentType } from '../../../brackhits/constants/brackhits.constants';
import { BrackhitContent } from '../../../brackhits-content/dto/input/brackhit-content.dto';
import { ApiProperty } from '@nestjs/swagger';

class TriviaResolution {
  @ApiProperty({ required: false })
  successText: string;
  @ApiProperty({ required: false })
  failText: string;
  @ApiProperty({ required: false })
  thumbnail: string;
  @ApiProperty({ required: false })
  detailText: string;
}

class TriviaQuestion {
  @ApiProperty()
  name: string;
  @ApiProperty({ type: BrackhitContentType })
  type: BrackhitContentType;
  @ApiProperty()
  choices: TriviaQuestionType[];
  @ApiProperty({ required: false, type: TriviaResolution })
  resolution?: TriviaResolution;
}

export class CreateTriviaDto {
  @ApiProperty()
  name: string;
  questions: TriviaQuestion[];
}

type TriviaQuestionType = BrackhitContent & { isCorrect: 0 | 1 };
