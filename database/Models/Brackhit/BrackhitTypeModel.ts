import { Model } from 'objection';

import { BrackhitContentType } from '../../../src/modules/brackhits/constants/brackhits.constants';

export class BrackhitTypeModel extends Model {
  typeId: number;
  type: BrackhitContentType;

  static get tableName() {
    return 'labl.brackhit_type';
  }

  static get idColumn() {
    return 'typeId';
  }
}
