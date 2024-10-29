import { Model } from 'objection';
import {
  BrackhitCardTypes,
  CategorySortingType,
  CategoryType,
} from '../../../src/modules/brackhits/constants/brackhits-hub.constants';
import { BrackhitItemPreviewDto } from '../../../src/modules/brackhits/dto/brackhits-hub.dto';
import { BrackhitCategoriesSortModel } from './BrackhitCategoriesSortModel';
import {
  BrackhitItemDto,
  CategoryItemsData,
  HubItemDto,
} from '../../../src/modules/brackhits/dto/brackhits-home.dto';
import { Relations } from '../../relations/relations';

export class BrackhitCategoriesModel extends Model {
  id: number;
  categoryName: string;
  type: CategoryType;
  cardType: BrackhitCardTypes;
  sourceId: number;
  previewCount: number;
  sortingId: number;
  sortingType: CategorySortingType;
  days: number;
  displayCompleted: number;
  offset: number;
  minCompletions: number;
  artistLimit: number;
  artistLimitSortId: number;
  artistLimitSortingType: CategorySortingType;
  artistLimitDays: number;
  data?: CategoryItemsData;
  items?: (BrackhitItemPreviewDto | HubItemDto | BrackhitItemDto)[];

  static get tableName() {
    return 'labl.brackhit_categories';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Sort]: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitCategoriesSortModel,
        join: {
          from: 'labl.brackhit_categories.sortingId',
          to: 'labl.brackhit_categories_sort.id',
        },
      },

      [Relations.ArtistLimitSort]: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitCategoriesSortModel,
        join: {
          from: 'labl.brackhit_categories.artistLimitSortId',
          to: 'labl.brackhit_categories_sort.id',
        },
      },
    };
  }
}
