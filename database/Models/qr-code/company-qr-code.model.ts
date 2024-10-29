import { Model } from 'objection';
import { Relations } from '@database/relations/relations';
import { QrCodeModel } from '@database/Models/qr-code/qr-code.model';

export class CompanyQrCodeModel extends Model {
  id: number;
  companyId: number;
  qrCodeId: number;

  qrCode: QrCodeModel;

  static get tableName() {
    return 'labl.company_qr_code';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.QrCode]: {
        relation: Model.HasOneRelation,
        modelClass: QrCodeModel,
        join: {
          from: `${CompanyQrCodeModel.tableName}.qrCodeId`,
          to: `${QrCodeModel.tableName}.id`,
        },
      },
    };
  }
}
