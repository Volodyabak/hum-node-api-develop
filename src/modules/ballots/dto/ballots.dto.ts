import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { CampaignUserDto } from '../../campaigns/dto/campaign.dto';
import { BrackhitContentType } from '../../brackhits/constants/brackhits.constants';
import { BrackhitContentExtraData } from '../../brackhits-content/dto/input/brackhit-content.dto';

export class BallotIdParam {
  @ApiProperty()
  @IsInt()
  ballotId: number;
}

export class BallotChoice {
  @ApiProperty()
  @IsInt()
  choiceId: number;

  @ApiProperty()
  @IsInt()
  voteRank: number;
}

export class BallotRound {
  @ApiProperty()
  @IsInt()
  roundId: number;

  @ApiProperty({ type: [BallotChoice] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BallotChoice)
  choices: BallotChoice[];
}

export class PostUserBallotChoicesBody {
  @ApiProperty()
  @IsNotEmptyObject()
  @ValidateNested({ each: true })
  @Type(() => CampaignUserDto)
  user: CampaignUserDto;

  @ApiProperty({ type: [BallotRound] })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BallotRound)
  rounds: BallotRound[];
}

export class PostBallotChoiceDto {
  // @IsNotEmpty()
  id: string | number;
  choiceId: number;
  data: BrackhitContentExtraData;
}

export class PostBallotCustomChoiceDto {
  name: string;
  thumbnail: string;
  contentUrl: string;
  sourceTypeId: number;
  choiceId: number;
}

export class PostBallotCategoryDto {
  categoryId?: number;
  detail?: string;
  categoryName: string;
  roundId: number;
  numberOfVotes: number = 1;
  votingTypeId: number;
  type: BrackhitContentType;
  @ApiProperty({ type: [PostBallotChoiceDto] })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PostBallotChoiceDto)
  choices: (PostBallotChoiceDto | PostBallotCustomChoiceDto)[];
}

export class PostBallotDto {
  name: string;
  votingTypeId: number; // will be deprecated soon
  @ApiProperty({ type: [PostBallotCategoryDto] })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PostBallotCategoryDto)
  categories: PostBallotCategoryDto[];
  campaignId?: number;
}
