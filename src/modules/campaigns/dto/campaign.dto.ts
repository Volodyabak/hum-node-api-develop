import { Type } from 'class-transformer';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { BallotRound } from '../../ballots/dto/ballots.dto';

export class CampaignIdDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  campaignId: number;
}

export class BrackhitCampaignParams extends CampaignIdDto {
  @ApiProperty()
  @IsInt()
  brackhitId: number;
}

export class CampaignDataQueryParamsDto {
  @ApiProperty({ required: false })
  @IsUUID('4')
  @IsNotEmpty()
  @IsOptional()
  companyId: string;

  @ApiProperty({ required: false })
  path: string;
}

export class CampaignUserDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  instagramUsername?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  zip?: string;

  confirmEmail?: unknown; // honeypot
}

export class CampaignChoice {
  @ApiProperty()
  roundId: number;

  @ApiProperty()
  choiceId: number;
}

export class SubmitCampaignDto {
  @ApiProperty({ description: 'Brackhit, ballot or trivia ID' })
  contentId: number;

  @ApiProperty({ required: false, type: CampaignUserDto })
  user: CampaignUserDto;

  @IsArray()
  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(CampaignChoice) },
        { $ref: '#/components/schemas/BallotRound' },
      ], // todo: fix @ApiExtraModels(BallotRound)
    },
  })
  @Type(() => Object, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: CampaignChoice, name: 'CampaignChoice' },
        { value: BallotRound, name: 'BallotRound' },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  answers: (CampaignChoice | BallotRound)[];

  @ApiProperty({
    required: false,
    description: 'Score is used only for contest brackhit campaigns',
  })
  score?: number;
}

export class ShareSlugDto {
  @ApiProperty()
  slug: string;

  @ApiProperty()
  userId: string;
}

export class GetChoicesWithNamesParamsDto {
  @ApiProperty()
  @IsInt()
  campaignId: number;

  @ApiProperty()
  @IsInt()
  brackhitId: number;
}
