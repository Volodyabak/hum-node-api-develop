import { BrackhitChallengesModel } from '../../../../database/Models';
import { IsDate, IsInt, IsNotEmpty, IsOptional, IsPositive, Min } from 'class-validator';
import { GET_CHALLENGE_LEADERBOARD_TAKE_DEFAULT } from '../constants/brackhits.constants';
import { ChallengeBrackhitDto } from '../dto/brackhits-challenges.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrackhitChallengeBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  challengeName: string;
  @ApiProperty()
  @IsInt()
  @IsPositive()
  reward: number;
  @ApiProperty()
  @IsOptional()
  @IsInt()
  @IsPositive()
  genreId: number = null;
  @ApiProperty()
  @IsDate()
  startDate: Date;
  @ApiProperty()
  @IsDate()
  endDate: Date;
}

export class GetBrackhitChallengesResponseDto {
  @ApiProperty({ type: [BrackhitChallengesModel] })
  challenges: BrackhitChallengesModel[];
}

export class GetChallengeResponseDto {
  @ApiProperty({ type: BrackhitChallengesModel })
  challenge: BrackhitChallengesModel;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  take: number;
  @ApiProperty()
  total: number;
  @ApiProperty({ type: [ChallengeBrackhitDto] })
  leaderboard: ChallengeBrackhitDto[];
}

export class GetChallengeQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  skip: number = 0;
  @ApiProperty({ required: false, default: GET_CHALLENGE_LEADERBOARD_TAKE_DEFAULT })
  @IsOptional()
  @Min(0)
  take: number = GET_CHALLENGE_LEADERBOARD_TAKE_DEFAULT;
}
