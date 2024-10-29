import { Injectable, NotFoundException } from '@nestjs/common';
import QRCode, { QRCodeToDataURLOptions } from 'qrcode';
import { QrCodeModel } from '@database/Models/qr-code/qr-code.model';
import * as process from 'process';
import { v4 } from 'uuid';

@Injectable()
export class QrCodesService {
  async create(name: string, text: string, options?: QRCodeToDataURLOptions) {
    const uid = v4();
    const staticUrl = `${process.env.API_BASE_URL}/qr-codes/${uid}`;
    const qrCode = await QRCode.toDataURL(staticUrl, options);

    return QrCodeModel.query().insertAndFetch({
      uid,
      name,
      staticUrl,
      image: qrCode,
      dynamicUrl: text,
    });
  }

  async findOne(uid: string) {
    const qrCode = await QrCodeModel.query().findOne({ uid });

    if (!qrCode) {
      throw new NotFoundException('QR code not found');
    }

    return qrCode;
  }
}
