import { Model } from 'objection';
import { BrackhitTagModel } from './BrackhitTagModel';
import { BrackhitModel } from '../BrackhitModel';
import { Relations } from '../../relations/relations';

export class BrackhitTagTypeModel extends Model {
  id: number;
  tag: string;
  cardType?: number;
  type?: string;
  brackhits?: any[];

  static get tableName() {
    return 'labl.brackhit_tag_type';
  }

  static get idColumn() {
    return 'tagId';
  }

  static get relationMappings() {
    return {
      [Relations.Brackhits]: {
        relation: Model.ManyToManyRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.brackhit_tag_type.tagId',
          through: {
            modelClass: BrackhitTagModel,
            from: 'labl.brackhit_tag.tagId',
            to: 'labl.brackhit_tag.brackhitId',
          },
          to: 'labl.brackhit.brackhitId',
        },
      },
    };
  }
}
