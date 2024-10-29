import { Injectable } from '@nestjs/common';
import { TiktokModel } from '@database/Models/tiktok.model';

@Injectable()
export class TiktokService {
  async getTiktokPost(id: number | string) {
    const data = typeof id === 'string' ? { tiktokId: id } : { id };
    return TiktokModel.query().findOne(data);
  }

  async saveTiktokPost(tiktokId: string) {
    // todo: add tiktok api integration
    await TiktokModel.query().insert({ tiktokId }).onConflict().merge(['tiktokId']);
    return TiktokModel.query().findOne({ tiktokId });
  }
}
