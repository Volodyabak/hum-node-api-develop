import { Model } from 'objection';

export class QrCodeModel extends Model {
  id: number;
  uid: string;
  name: string;
  staticUrl: string;
  dynamicUrl: string;
  createdAt: Date;
  updatedAt: Date;

  image: string;

  static get tableName() {
    return 'labl.qr_code';
  }

  static get idColumn() {
    return 'id';
  }
}
