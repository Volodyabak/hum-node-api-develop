import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  IsArray,
  ArrayNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChoiceDto } from '../../../../common/dto/games/choice.input.dto';

export class FeedbackDto {
  @ApiProperty({ description: 'Success feedback text' })
  @IsNotEmpty()
  @IsString()
  successText: string;

  @ApiProperty({ description: 'Failure feedback text' })
  @IsNotEmpty()
  @IsString()
  failText: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL for the feedback' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({ description: 'Detailed feedback text' })
  @IsOptional()
  @IsString()
  detailText?: string;
}

export class ResolveDto {
  @ApiProperty({ type: [Number], description: 'Array of correct choice IDs' })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  choiceIds: number[];

  @ApiProperty({ description: 'Feedback for correct and incorrect answers' })
  @ValidateNested()
  @Type(() => FeedbackDto)
  feedback: FeedbackDto;
}

export class QuestionDto {
  @ApiProperty({ description: 'Question prompt' })
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: 'Countdown clock for the question in seconds' })
  @IsOptional()
  @IsNumber()
  countdownClock?: number;

  @ApiPropertyOptional({ description: 'Allow selecting multiple choices' })
  @IsOptional()
  allowMultipleSelection?: boolean;

  @ApiProperty({ type: [ChoiceDto], description: 'Choices for the question' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choices: ChoiceDto[];

  @ApiPropertyOptional({
    description: 'Resolution details for the question (required for Trivia game)',
  })
  @ValidateIf((o) => o.gameType === 'Trivia')
  @ValidateNested()
  @Type(() => ResolveDto)
  resolve: ResolveDto;
}

export class RoundDto {
  @ApiProperty({ description: 'ID of the round' })
  @IsNotEmpty()
  @IsNumber()
  roundId: number;

  @ApiProperty({ description: 'Difficulty level of the round' })
  @IsNotEmpty()
  @IsNumber()
  level: number;

  @ApiPropertyOptional({ description: 'Thumbnail URL for the round' })
  @IsOptional()
  @IsString()
  thumbnail: string;

  @ApiProperty({ type: QuestionDto, description: 'Question in the round' })
  @ValidateNested()
  @Type(() => QuestionDto)
  question: QuestionDto;
}

export class CreateGameDto {
  @ApiProperty({ description: 'Name of the game' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the game' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL of the game thumbnail' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ description: 'Type of the game' })
  @IsNotEmpty()
  @IsString()
  gameType: string;

  @ApiProperty({ description: 'Number of questions in the game' })
  @IsNotEmpty()
  @IsNumber()
  questionCount: number;

  @ApiPropertyOptional({ description: 'Points awarded per correct answer' })
  @IsOptional()
  @IsNumber()
  pointsPerCorrectAnswer?: number;

  @ApiPropertyOptional({ description: 'Number of lives in the game' })
  @IsOptional()
  @IsNumber()
  lives?: number;

  @ApiPropertyOptional({ description: 'End game on first wrong answer' })
  @IsOptional()
  endOnFirstWrongAnswer?: boolean;

  @ApiPropertyOptional({ description: 'Allow retry on failure' })
  @IsOptional()
  allowRetry?: boolean;

  @ApiPropertyOptional({ description: 'Enable multiple levels of difficulty' })
  @IsOptional()
  multipleLevels?: boolean;

  @ApiPropertyOptional({ description: 'Pull questions from a question bank' })
  @IsOptional()
  pullFromQuestionBank?: boolean;

  @ApiPropertyOptional({ description: 'ID of the question bank' })
  @IsOptional()
  questionBankId?: string;

  @ApiProperty({ type: [RoundDto], description: 'Rounds in the game' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RoundDto)
  rounds: RoundDto[];
}
