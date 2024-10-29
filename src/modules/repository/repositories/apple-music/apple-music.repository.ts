import { Injectable } from '@nestjs/common';
import { AppleUserTokensModel } from '../../../../../database/Models/apple/apple-user-tokens.model';

@Injectable()
export class AppleMusicRepository {
  getAppleMusicUserToken(userId: string) {
    return AppleUserTokensModel.query().findOne({ userId });
  }

  saveAppleMusicUserToken(data: Partial<AppleUserTokensModel>) {
    return AppleUserTokensModel.query().insertAndFetch(data);
  }

  updateAppleMusicUserToken(userId: string, data: Partial<AppleUserTokensModel>) {
    return AppleUserTokensModel.query().patchAndFetchById(userId, data);
  }
}
