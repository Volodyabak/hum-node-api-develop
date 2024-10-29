import { Module } from '@nestjs/common';
import { QrCodesService } from './services/qr-codes.service';
import { QrCodesController } from './controllers/qr-codes.controller';

@Module({
  controllers: [QrCodesController],
  providers: [QrCodesService],
  exports: [QrCodesService],
})
export class QrCodesModule {}
