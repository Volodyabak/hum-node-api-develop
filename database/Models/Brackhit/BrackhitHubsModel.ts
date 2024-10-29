import { Model } from 'objection';
import { BrackhitHubTypes } from '../../../src/modules/brackhits/constants/brackhits-hub.constants';

export class BrackhitHubsModel extends Model {
  hubId: number;
  hub: string;
  type: BrackhitHubTypes;
  categoryIds: string;
  sourceId: number;
  position: number;

  static get tableName() {
    return 'labl.brackhit_hubs';
  }

  static get idColumn() {
    return 'hubId';
  }
}
