import { Injectable } from '@nestjs/common';
import { BrackhitRepository } from './brackhit.repository';
import {
  BrackhitCategoriesModel,
  BrackhitHubsModel,
  BrackhitTagTypeModel,
} from '../../../../../database/Models';
import { BrackhitModel } from '../../../../../database/Models/BrackhitModel';
import { DateUtils } from '../../../../Tools/utils/date-utils';
import {
  BRACKHIT_ERA_HUB_TAG_MAP,
  BRACKHIT_TRENDING_PERIOD,
  BrackhitEraHubs,
  BrackhitHubs,
  BrackhitSpecialHubs,
  BrackhitTags,
} from '../../../brackhits/constants/brackhits-hub.constants';
import { BrackhitUserModel } from '../../../../../database/Models/BrackhitUserModel';
import { BrackhitHubMetaDto, BrackhitJustInParams } from '../../../brackhits/dto/brackhits-hub.dto';
import { Database } from '../../../../../database/database';
import {
  GET_FOR_YOU_BRACKHITS_BY_SPOTIFY_RANK,
  GET_FOR_YOU_BRACKHITS_BY_USER_CHOICE,
  GET_FOR_YOU_NONE_BRACKHITS_BY_SPOTIFY_RANK,
  GET_FOR_YOU_NONE_BRACKHITS_BY_USER_CHOICE,
} from '../../../brackhits/queries/brackhits-hubs.queries';
import { QueryBuilder } from 'objection';
import { BrackhitIdParamDto } from '../../../../Tools/dto/main-api.dto';
import { BrackhitGenreModel } from '../../../../../database/Models/BrackhitGenreModel';
import { CategoryParams } from '../../../brackhits/interfaces/brackhits-home.interface';

@Injectable()
export class BrackhitHubRepository {
  constructor(private readonly brackhitRepository: BrackhitRepository) {}

  getBrackhitCategoriesQB(ids: number[], order: number[]) {
    return BrackhitCategoriesModel.query()
      .whereIn('id', ids)
      .orderByRaw(`FIELD(id, ${order.join(', ')})`);
  }

  filterBrackhitHubsByIds(ids: number[], order: number[]) {
    return BrackhitHubsModel.query()
      .whereIn('hubId', ids)
      .orderByRaw(`FIELD(hub_id, ${order.join(', ')})`);
  }

  getBrackhitHubsQBFull(order: number[]) {
    return BrackhitHubsModel.query().orderByRaw(`FIELD(hub_id, ${order.join(', ')})`);
  }

  getBrackhitTagTypesQB(ids: number[]) {
    return BrackhitTagTypeModel.query().whereIn('tagId', ids).orderBy('tagId', 'desc');
  }

  getFeaturedBrackhitsQB(userId: string, userTime: Date, take?: number) {
    return BrackhitModel.query()
      .alias('b')
      .where('b.featured', 1)
      .andWhere('b.timeLive', '<=', userTime)
      .orderBy('b.brackhitId', 'desc')
      .limit(take || Number.MAX_SAFE_INTEGER);
  }

  getTrendingBrackhitsQB(userId: string, userTime: Date, take?: number) {
    const trendingTime = DateUtils.subtractHoursFromDate(userTime, BRACKHIT_TRENDING_PERIOD);

    return BrackhitModel.query()
      .alias('b')
      .leftJoinRelated('brackhitUser as bu2')
      .where('b.featured', 0)
      .where('b.timeLive', '<=', userTime)
      .where(BrackhitUserModel.callbacks.whereIsCompleteZeroOrNull('bu')) // brackhit_user table is joined later
      .whereBetween('bu2.updatedAt', [trendingTime, userTime])
      .groupBy('b.brackhitId')
      .orderByRaw(BrackhitUserModel.rawSql.orderByIsCompleteSumDesc('bu2'))
      .limit(take || Number.MAX_SAFE_INTEGER);
  }

  getPopularBrackhitsQB(userId: string, userTime: Date, take?: number) {
    return BrackhitModel.query()
      .alias('b')
      .leftJoinRelated('brackhitUser as bu2')
      .where('b.timeLive', '<=', userTime)
      .groupBy('b.brackhitId')
      .orderByRaw(BrackhitUserModel.rawSql.orderByIsCompleteSumDesc('bu2'))
      .limit(take || Number.MAX_SAFE_INTEGER);
  }

  getJustInBrackhitsQB(
    userId: string,
    userTime: Date,
    takeAll: boolean,
    params: BrackhitJustInParams,
  ) {
    return BrackhitModel.query()
      .alias('b')
      .where('b.ownerId', 'artistory')
      .where('b.timeLive', '<=', userTime);
  }

  getForYouBrackhitsBySpotifyRank(
    userId: string,
    userTime: Date,
    take?: number,
  ): Promise<BrackhitHubMetaDto[]> {
    return Database.executeQuery<BrackhitHubMetaDto>(
      GET_FOR_YOU_BRACKHITS_BY_SPOTIFY_RANK,
      {
        userId,
        userTime: userTime.toISOString(),
        take: take || Number.MAX_SAFE_INTEGER,
      },
      'BrackhitsHubRepository getForYouBrackhitsBySpotifyRank() GET_FOR_YOU_BRACKHITS_BY_SPOTIFY_RANK Error: ',
    );
  }

  getForYouNoneBrackhitsBySpotifyRank(
    userId: string,
    userTime: Date,
    take?: number,
  ): Promise<BrackhitHubMetaDto[]> {
    return Database.executeQuery<BrackhitHubMetaDto>(
      GET_FOR_YOU_NONE_BRACKHITS_BY_SPOTIFY_RANK,
      {
        userId,
        userTime: userTime.toISOString(),
        take: take || Number.MAX_SAFE_INTEGER,
      },
      'BrackhitsHubRepository getForYouNoneBrackhitsBySpotifyRank() GET_FOR_YOU_NONE_BRACKHITS_BY_SPOTIFY_RANK Error: ',
    );
  }

  getForYouNoneBrackhitsByUserChoice(userId: string, userTime: Date, take?: number) {
    return Database.executeQuery<BrackhitHubMetaDto>(
      GET_FOR_YOU_NONE_BRACKHITS_BY_USER_CHOICE,
      {
        userId,
        userTime,
        take: take || Number.MAX_SAFE_INTEGER,
      },
      'BrackhitsHubRepository getForYouNoneBrackhitsByUserChoice() GET_FOR_YOU_NONE_BRACKHITS_BY_USER_CHOICE Error: ',
    );
  }

  getForYouBrackhitsByUserChoice(userId: string, userTime: Date, take?: number) {
    return Database.executeQuery<BrackhitHubMetaDto>(
      GET_FOR_YOU_BRACKHITS_BY_USER_CHOICE,
      {
        userId,
        userTime,
        take: take || Number.MAX_SAFE_INTEGER,
      },
      'BrackhitsHubRepository getForYouBrackhitsByUserChoice() GET_FOR_YOU_BRACKHITS_BY_USER_CHOICE Error: ',
    );
  }

  getPreviewAlbumBrackhitsQB(userId: string, userTime: Date, take?: number) {
    return BrackhitModel.query()
      .alias('b')
      .from(this.brackhitRepository.getAlbumBrackhits(userId, userTime).as('b'))
      .leftJoinRelated('brackhitUser as bu2')
      .where(BrackhitUserModel.callbacks.whereIsCompleteZeroOrNull('bu'))
      .groupBy('b.brackhitId')
      .orderByRaw(BrackhitUserModel.rawSql.orderByIsCompleteSumDesc('bu2'))
      .limit(take || Number.MAX_SAFE_INTEGER);
  }

  getAllAlbumBrackhitsQB(userId: string, userTime: Date) {
    const albumBrackhits = this.brackhitRepository.getAlbumBrackhits(userId, userTime);
    return BrackhitModel.query()
      .alias('b')
      .from(albumBrackhits.as('b'))
      .orderBy('b.timeLive', 'desc');
  }

  getMadeByFansBrackhitsQB(userId: string, userTime: Date, take?: number) {
    return BrackhitModel.query()
      .alias('b')
      .where('b.timeLive', '<=', userTime)
      .whereNot('b.ownerId', 'artistory')
      .orderBy('b.brackhitId', 'desc')
      .limit(take || Number.MAX_SAFE_INTEGER);
  }

  getHomeTagBrackhitsQB(tagId: BrackhitTags, userId: string, userTime: Date, take?: number) {
    return this.brackhitRepository
      .getTagBrackhits(tagId)
      .where('b.timeLive', '<=', userTime)
      .orderBy('b.timeLive', 'desc')
      .limit(take || Number.MAX_SAFE_INTEGER);
  }

  filterFeaturedBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    userId: string,
    userTime: Date,
    take?: number,
  ) {
    return this.getFeaturedBrackhitsQB(userId, userTime, take).join(
      brackhitsQB.as('sub'),
      'b.brackhitId',
      'sub.brackhitId',
    );
  }

  filterTrendingBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    userId: string,
    userTime: Date,
    take?: number,
  ) {
    return this.getTrendingBrackhitsQB(userId, userTime, take).join(
      brackhitsQB.as('sub'),
      'b.brackhitId',
      'sub.brackhitId',
    );
  }

  filterPopularBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    userId: string,
    userTime: Date,
    take?: number,
  ) {
    return this.getPopularBrackhitsQB(userId, userTime, take).join(
      brackhitsQB.as('sub'),
      'b.brackhitId',
      'sub.brackhitId',
    );
  }

  filterJustInBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    hubId: BrackhitHubs,
    userId: string,
    userTime: Date,
    takeAll: boolean,
    take?: number,
  ) {
    let justInBrackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>;

    if (BrackhitSpecialHubs.includes(hubId)) {
      justInBrackhitsQB = this.getJustInBrackhitsQB(userId, userTime, takeAll, {
        take,
        includeMadeByFans: true,
      });
    } else {
      justInBrackhitsQB = this.getJustInBrackhitsQB(userId, userTime, takeAll, { take });
    }

    return justInBrackhitsQB.join(brackhitsQB.as('sub'), 'b.brackhitId', 'sub.brackhitId');
  }

  filterForYouBrackhits(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    forYouBrackhits: BrackhitIdParamDto[],
    userId: string,
    userTime: Date,
    take?: number,
  ) {
    return BrackhitModel.query()
      .alias('b')
      .join(brackhitsQB.as('sub'), 'b.brackhitId', 'sub.brackhitId')
      .whereIn(
        'b.brackhitId',
        forYouBrackhits.map((b) => b.brackhitId),
      )
      .limit(take || Number.MAX_SAFE_INTEGER);
  }

  filterAllAlbumBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    userId: string,
    userTime: Date,
  ) {
    return this.getAllAlbumBrackhitsQB(userId, userTime).join(
      brackhitsQB.as('sub'),
      'b.brackhitId',
      'sub.brackhitId',
    );
  }

  filterPreviewAlbumBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    userId: string,
    userTime: Date,
    take?: number,
  ) {
    return this.getPreviewAlbumBrackhitsQB(userId, userTime, take).join(
      brackhitsQB.as('sub'),
      'b.brackhitId',
      'sub.brackhitId',
    );
  }

  filterMadeByFansBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    userId: string,
    userTime: Date,
    take?: number,
  ) {
    return this.getMadeByFansBrackhitsQB(userId, userTime, take).join(
      brackhitsQB.as('sub'),
      'b.brackhitId',
      'sub.brackhitId',
    );
  }

  filterTagBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    hubId: BrackhitHubs,
    tagId: BrackhitTags,
    userId: string,
    userTime: Date,
    params: CategoryParams,
  ) {
    let tagBrackhitsQB = this.brackhitRepository
      .getTagBrackhits(tagId)
      .join(brackhitsQB.as('sub'), 'sub.brackhitId', 'b.brackhitId')
      .where('b.timeLive', '<=', userTime);

    if (BrackhitEraHubs.includes(hubId)) {
      tagBrackhitsQB = this.brackhitRepository.getBrackhitsSortedByCompletionsInLastXDays(
        tagBrackhitsQB,
        userTime,
        params,
      );
      // join is performed in the end because sorting by completions uses sub query
      this.leftJoinBrackhitUserToBrackhitsQB(tagBrackhitsQB, userId);
    } else {
      // join is performed at the beginning because era tag brackhits are sorted by userStatus
      this.leftJoinBrackhitUserToBrackhitsQB(tagBrackhitsQB, userId);

      if (hubId === BrackhitHubs.MadeByFans) {
        tagBrackhitsQB = tagBrackhitsQB.orderBy('b.brackhitId', 'desc');
      } else {
        tagBrackhitsQB = tagBrackhitsQB
          .orderByRaw(BrackhitUserModel.rawSql.getUserStatusOrder())
          .orderBy('b.brackhitId', 'desc');
      }
    }

    return tagBrackhitsQB.offset(params.skip).limit(params.take);
  }

  getHubBrackhitsQB(hubId: BrackhitHubs) {
    if (hubId === BrackhitHubs.MadeByFans) {
      return this.brackhitRepository.getArtistoryBrackhits();
    } else if (BrackhitEraHubs.includes(hubId)) {
      const tagId = BRACKHIT_ERA_HUB_TAG_MAP.get(hubId);
      return this.brackhitRepository.getTagBrackhits(tagId);
    } else {
      return this.brackhitRepository.getBrackhitsByMasterGenre(hubId);
    }
  }

  filterGenreBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    genreId: number,
    userId: string,
    userTime: Date,
    params: CategoryParams,
  ) {
    return BrackhitModel.query()
      .alias('b')
      .join(brackhitsQB.as('sub'), 'b.brackhitId', 'sub.brackhitId')
      .join(
        BrackhitGenreModel.getTableNameWithAlias(),
        BrackhitGenreModel.callbacks.joinOnBrackhitIdAndOnValGenreId(genreId),
      )
      .where('b.timeLive', '<=', userTime)
      .orderBy('b.brackhitId', 'desc')
      .offset(params.skip)
      .limit(params.take || Number.MAX_SAFE_INTEGER);
  }

  leftJoinBrackhitUserToBrackhitsQB(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
    userId: string,
  ) {
    return brackhitsQB.leftJoin(
      BrackhitUserModel.getTableNameWithAlias(),
      BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId),
    );
  }
}
