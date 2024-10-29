import { Injectable } from '@nestjs/common';
import { CustomContentModel } from '@database/Models/campaign/custom-content.model';
import { isUndefined, omitBy } from 'lodash';

@Injectable()
export class CustomContentService {
  constructor() {}

  async getContentById(id: number) {
    return CustomContentModel.query().findById(id);
  }

  async saveContent(content: Partial<CustomContentModel>) {
    const data = {
      name: content.name,
      thumbnail: content.thumbnail,
      contentUrl: content.contentUrl,
      sourceTypeId: content.sourceTypeId,
    };
    const filtered = omitBy(data, isUndefined);
    return CustomContentModel.query().insertAndFetch(filtered);
  }

  async getContent(content: Partial<CustomContentModel>) {
    return CustomContentModel.query().findOne(content).skipUndefined();
  }
}
