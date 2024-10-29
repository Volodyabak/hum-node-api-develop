import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PostCampaignQrCodeInput {
  @ApiProperty({ description: 'QR Code alias' })
  @IsString()
  name: string;
}
