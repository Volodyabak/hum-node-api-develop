import { Model } from 'objection';

import { BrackhitContentModel } from '@database/Models/Brackhit';
import { BrackhitContentType } from '../../src/modules/brackhits/constants/brackhits.constants';

export enum BrackhitContentTypeId {
  track = 1,
  artist = 2,
  youtube = 3,
  album = 4,
  vimeo = 5,
  custom = 6,
  tiktok = 7,
  youtube_clip = 8,
}

export class BrackhitContentTypeModel extends Model {
  contentTypeId: number;
  contentType: BrackhitContentType;

  static get tableName() {
    return 'labl.brackhit_content_type';
  }

  static get idColumn() {
    return 'contentTypeId';
  }

  static get relationMappings() {
    return {
      content: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: 'labl.brackhit_content_type.contentTypeId',
          to: 'labl.brackhit_content.contentTypeId',
        },
      },
    };
  }
}
