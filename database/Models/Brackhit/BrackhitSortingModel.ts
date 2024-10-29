import { Model } from 'objection';

export enum BRACKHIT_SORTING {
  DEFAULT = 'DEFAULT',
  PLAYLIST_ORDER = 'PLAYLIST_ORDER',
  CUSTOM = 'CUSTOM',
}

export class BrackhitSortingModel extends Model {
  id: number;
  sort: BRACKHIT_SORTING;

  static get tableName() {
    return 'labl.brackhit_sorting';
  }

  static get idColumn() {
    return 'id';
  }
}
