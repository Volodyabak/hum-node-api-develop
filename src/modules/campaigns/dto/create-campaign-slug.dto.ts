import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignSlugDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
