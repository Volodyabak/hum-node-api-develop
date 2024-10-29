import { Module } from '@nestjs/common';
import { ConversionApiService } from './services/conversion-api.service';

@Module({
  providers: [ConversionApiService],
  exports: [ConversionApiService],
})
export class FacebookModule {}
