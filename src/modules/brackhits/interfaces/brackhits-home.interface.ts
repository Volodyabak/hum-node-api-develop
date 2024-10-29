import { BrackhitCategory, CategorySortingType } from '../constants/brackhits-hub.constants';

export interface GetHomeBrackhitsQueryBase {
  categoryId: BrackhitCategory;
  skip: number;
  take: number;
}

export interface CategoryParams {
  preview?: boolean;
  skip: number;
  take: number;
}

export interface CategorySortingParams {
  sortingType: CategorySortingType;
  date?: Date;
  days?: number;
}
