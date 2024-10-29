import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CustomContentMediaType } from '@database/Models';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCampaignChoicesDetailsInput {
  @ApiProperty()
  @Type(() => CampaignChoiceDetails)
  choices: CampaignChoiceDetails[];
}

class CampaignChoiceDetails {
  @ApiProperty()
  @IsNumber()
  choiceId: number;
  @ApiProperty()
  @IsString()
  primaryName: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  secondaryName: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  detail: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  additionalMedia: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsEnum(CustomContentMediaType)
  mediaType: CustomContentMediaType;
}
