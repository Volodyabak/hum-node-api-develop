import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChoiceDto } from '../../../../common/dto/games/choice.input.dto';
import { BallotRoundVoteType } from '@database/mongodb/games/ballot';

export class BallotRoundDto {
  @ApiProperty({ description: 'ID of the round' })
  @IsNotEmpty()
  @IsInt()
  roundId: number;

  @ApiProperty({ description: 'Number of votes allowed for this round', default: 1 })
  @IsNotEmpty()
  @IsInt()
  numberOfVotes: number;

  @ApiProperty({ description: 'Name of the round' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the round' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BallotRoundVoteType, description: 'Voting type for the round' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(BallotRoundVoteType)
  votingType: BallotRoundVoteType;

  @ApiProperty({ type: [ChoiceDto], description: 'Choices for this round' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choices: ChoiceDto[];
}

export class CreateBallotDto {
  @ApiProperty({ description: 'Name of the ballot' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the ballot' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL for the ballot' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ type: [BallotRoundDto], description: 'Rounds in the ballot' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BallotRoundDto)
  rounds: BallotRoundDto[];
}
