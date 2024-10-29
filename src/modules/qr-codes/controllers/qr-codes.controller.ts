import { Controller, Get, Param, Res } from '@nestjs/common';
import { QrCodesService } from '../services/qr-codes.service';
import { UidParamDto } from '../../../Tools/dto/main-api.dto';

@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Get(':id')
  async handleDynamicQrCode(@Param() param: UidParamDto, @Res() res) {
    const qrCode = await this.qrCodesService.findOne(param.id);
    res.redirect(qrCode.dynamicUrl);
  }
}
