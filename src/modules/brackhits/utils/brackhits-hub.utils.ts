import {
  BrackhitCategory,
  BRACKHITS_CARD_DEFAULT_COUNT,
  BRACKHITS_FOR_YOU_FULL_COUNT,
  BRACKHITS_HOME_CATEGORY_CARD_COUNT,
  BRACKHITS_HUB_CATEGORY_CARD_COUNT,
} from '../constants/brackhits-hub.constants';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { BrackhitHubMetaDto, BrackhitItemPreviewDto } from '../dto/brackhits-hub.dto';
import { BrackhitsUtils } from './brackhits.utils';
import { QueryBuilder } from 'objection';

export class BrackhitsHubUtils {
  static getCategoryCardFullBrackhitsCount(categoryId: BrackhitCategory) {
    if (categoryId === BrackhitCategory.ForYou) {
      return BRACKHITS_FOR_YOU_FULL_COUNT;
    }
    return Number.MAX_SAFE_INTEGER;
  }

  static getHomeCategoryPreviewBrackhitsCount(categoryId: BrackhitCategory) {
    if (BRACKHITS_HOME_CATEGORY_CARD_COUNT.has(categoryId)) {
      return BRACKHITS_HOME_CATEGORY_CARD_COUNT.get(categoryId);
    }
    return BRACKHITS_CARD_DEFAULT_COUNT;
  }

  static getHubCategoryPreviewBrackhitsCount(categoryId: BrackhitCategory): number {
    return BRACKHITS_HUB_CATEGORY_CARD_COUNT.get(categoryId) || BRACKHITS_CARD_DEFAULT_COUNT;
  }

  static parseBrackhitItemPreviews(
    brackhits: BrackhitHubMetaDto[],
    userTime: Date,
  ): BrackhitItemPreviewDto[] {
    return brackhits.map((b) => ({
      brackhitId: b.brackhitId,
      name: b.name,
      thumbnail: b.thumbnail,
      isLive: BrackhitsUtils.isLiveBrackhit(b, userTime),
      userStatus: BrackhitsUtils.identifyUserBrackhitStatus(b),
    }));
  }

  static async selectBrackhitMetaQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
  ): Promise<BrackhitHubMetaDto[]> {
    return brackhitsQB.select(
      'b.brackhitId',
      'b.name',
      'b.thumbnail',
      'b.timeLive',
      'b.duration',
      'b.scoringState',
      'bu.isComplete as isCompleted',
    );
  }
}
