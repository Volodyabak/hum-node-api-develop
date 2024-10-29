import { Model } from 'objection';

export class BrackhitCustomContentNameModel extends Model {
  id: number;
  brackhitId: number;
  campaignId: number;
  choiceId: number;
  customName: string;

  static get tableName() {
    return 'labl.brackhit_custom_content_name';
  }

  static get idColumn() {
    return 'id';
  }
}
