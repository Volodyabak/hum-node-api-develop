import { ApiProperty } from '@nestjs/swagger';

export class DuplicateCampaignInput {
  @ApiProperty({ required: true })
  name: string;
  @ApiProperty({ required: true })
  link: string;
}
