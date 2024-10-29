import { Injectable } from '@nestjs/common';
import { ConstantId } from '../constants';
import { ConstantsModel } from '../../../../database/Models/ConstantsModel';

@Injectable()
export class ConstantsRepository {
  getConstant(id: ConstantId) {
    return ConstantsModel.query().alias('const').findById(id);
  }
}
