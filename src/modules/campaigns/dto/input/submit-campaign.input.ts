import { Type } from 'class-transformer';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { CampaignChoice, CampaignUserDto } from '../campaign.dto';
import { BallotRound } from '../../../ballots/dto';

export class SubmitChoice {
  @ApiProperty({ description: 'ID of the choice' })
  @IsInt()
  @IsNotEmpty()
  choiceId: number;

  @ApiProperty({ description: 'Vote rank for ranked voting (optional)', required: false })
  @IsOptional()
  @IsInt()
  voteRank?: number;
}

export class SingleChoiceRound {
  @ApiProperty({ description: 'ID of the round' })
  @IsInt()
  @IsNotEmpty()
  roundId: number;

  @ApiProperty({ description: 'ID of the selected choice for the round' })
  @IsInt()
  @IsNotEmpty()
  choiceId: number;
}

export class MultipleChoicesRound {
  @ApiProperty({ description: 'ID of the round' })
  @IsInt()
  @IsNotEmpty()
  roundId: number;

  @ApiProperty({
    type: [SubmitChoice],
    description: 'Array of choices submitted for this round',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitChoice)
  choices: SubmitChoice[];
}

@ApiExtraModels(SingleChoiceRound, MultipleChoicesRound)
export class SubmitCampaignInput {
  @ApiProperty({ description: 'ID of the content (e.g., Trivia, Brackhit, Ballot)' })
  @IsNotEmpty()
  contentId: number | string;

  @ApiProperty({ description: 'User information for the submission' })
  @ValidateNested()
  @Type(() => CampaignUserDto)
  user: CampaignUserDto;

  @ApiProperty({
    description: 'Array of answers for the campaign, can be single or multiple choices',
    oneOf: [
      { $ref: getSchemaPath(SingleChoiceRound) },
      { $ref: getSchemaPath(MultipleChoicesRound) },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object, {
    discriminator: {
      property: 'roundType',
      subTypes: [
        { value: CampaignChoice, name: 'single' },
        { value: BallotRound, name: 'multiple' },
      ],
    },
  })
  answers: SingleChoiceRound[] | MultipleChoicesRound[];

  @ApiProperty({ description: 'Score for contest brackhit campaigns only', required: false })
  @IsInt()
  @IsOptional()
  score?: number;
}
