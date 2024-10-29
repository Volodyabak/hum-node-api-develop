import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CampaignSlugIdParam {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  slugId: number;
}
