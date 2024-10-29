import { Injectable } from '@nestjs/common';
import { QueryBuilder } from 'objection';
import {
  ArtistCategoryModel,
  ArtistModel,
  BrackhitArtistsAppearancesModel,
  CategoriesModel,
  DailyScoresModel,
  SpotifyAlbumModel,
  SpotifyArtistModel,
  SpotifyTrackModel,
  UserFeedPreferencesModel,
} from '../../../../../database/Models';
import { JoinOperation, JoinParams, JoinThroughParams } from '../../../../Tools/dto/util-classes';
import { QueryBuilderUtils } from '../../../../Tools/utils/query-builder.utils';
import { expr } from '../../../../../database/relations/relation-builder';
import { Relations } from '../../../../../database/relations/relations';

@Injectable()
export class ArtistRepository {
  getArtist(data: Partial<ArtistModel>) {
    return ArtistModel.query().findOne(data);
  }

  getAlbum(data: Partial<SpotifyAlbumModel>) {
    return SpotifyAlbumModel.query().findOne(data);
  }

  // params.to = 'ufp', params.from = 'a, params.joinOperation = leftJoin are set by default
  joinUserFeedToArtistsQB(
    artistsQB: QueryBuilder<ArtistModel, ArtistModel[]>,
    userId: string,
    params: JoinParams = {},
  ): void {
    QueryBuilderUtils.setDefaultJoinParams(params, 'a', 'ufp', JoinOperation.leftJoin);

    const tableName = UserFeedPreferencesModel.getTableNameWithAlias(params.to);
    const callback = UserFeedPreferencesModel.callbacks.onArtistIdAndUserIdVal(
      userId,
      params.from,
      params.to,
    );

    if (params.join === JoinOperation.leftJoin) {
      artistsQB.leftJoin(tableName, callback);
    } else if (params.join === JoinOperation.innerJoin) {
      artistsQB.join(tableName, callback);
    }
  }

  joinDailyScoreToArtistsQB(
    artistsQB: QueryBuilder<ArtistModel, ArtistModel[]>,
    params: JoinParams,
  ): void {
    const dailyScores = this.getArtistsMaxDateDailyScore().as(params.to);

    if (params.join === JoinOperation.leftJoin) {
      artistsQB.leftJoin(dailyScores, `${params.to}.artistId`, `${params.from}.id`);
    } else if (params.join === JoinOperation.innerJoin) {
      artistsQB.join(dailyScores, `${params.to}.artistId`, `${params.from}.id`);
    }
  }

  // TODO: use getArtistsMaxRunCategory method inside
  joinCategoryToArtistsQB(
    artistsQB: QueryBuilder<ArtistModel, ArtistModel[]>,
    params: JoinThroughParams,
  ): void {
    const categoryTableName = CategoriesModel.getTableNameWithAlias(params.to);
    const artistCategoryTableName = ArtistCategoryModel.getTableNameWithAlias(params.through);
    const artistCategoryCallback = ArtistCategoryModel.callbacks.onCategoryWithMaxRunAndArtistId(
      params.from,
      params.through,
    );

    if (params.join === JoinOperation.leftJoin) {
      artistsQB
        .leftJoin(artistCategoryTableName, artistCategoryCallback)
        .leftJoin(categoryTableName, `${params.to}.id`, `${params.through}.categoryId`);
    } else if (params.join === JoinOperation.innerJoin) {
      artistsQB
        .join(artistCategoryTableName, artistCategoryCallback)
        .join(categoryTableName, `${params.to}.id`, `${params.through}.categoryId`);
    }
  }

  // joins spotifyArtist, dailyScore, category, genre and userFeed data to artists
  getArtistsMeta(userId: string) {
    const artistsQB = ArtistModel.query()
      .alias('a')
      .leftJoinRelated(expr([Relations.SpotifyArtist, 'sa'], [Relations.Genre, 'g']));

    this.joinDailyScoreToArtistsQB(artistsQB, {
      from: 'a',
      to: 'ds',
      join: JoinOperation.leftJoin,
    });
    this.joinCategoryToArtistsQB(artistsQB, {
      from: 'a',
      through: 'ac',
      to: 'c',
      join: JoinOperation.leftJoin,
    });
    this.joinUserFeedToArtistsQB(artistsQB, userId);

    return artistsQB;
  }

  searchArtistsByName(query: string) {
    return ArtistModel.query().alias('a').where('a.facebookName', 'like', `%${query}%`);
  }

  getArtistsByGenre(genreId: number) {
    return ArtistModel.query()
      .alias('a')
      .joinRelated(expr([Relations.Genre, 'g']))
      .where('g.genreId', genreId);
  }

  // TODO: change all usages to getArtistsByCategories, leave join to category table
  getArtistsByCategory(categoryId: number) {
    const artistsQB = ArtistModel.query().alias('a').where('c.id', categoryId);

    this.joinCategoryToArtistsQB(artistsQB, {
      from: 'a',
      through: 'ac',
      to: 'c',
      join: JoinOperation.innerJoin,
    });

    return artistsQB;
  }

  getArtistsByCategories(categoryIds: string[] | number[]) {
    const categoriesQB = this.getArtistsMaxRunCategory();

    return ArtistModel.query()
      .alias('a')
      .join(categoriesQB.as('ac'), 'ac.artistId', 'a.id')
      .whereIn(`ac.categoryId`, categoryIds);
  }

  getArtistsByGenreAndCategory(genreId: number, categoryId: number) {
    return this.getArtistsByCategory(categoryId)
      .joinRelated(expr([Relations.Genre, 'g']))
      .where('g.genreId', genreId);
  }

  getArtistReleaseBlurbs(artistId: number) {
    return SpotifyAlbumModel.query()
      .alias('sal')
      .joinRelated(expr([Relations.SpotifyArtists, 'sa']))
      .where('sa.artistId', artistId)
      .groupBy('sal.id', 'sal.releaseDate');
  }

  getArtistCategory(artistId: number) {
    return CategoriesModel.query()
      .alias('c')
      .join(
        ArtistCategoryModel.getTableNameWithAlias('ac'),
        ArtistCategoryModel.callbacks.onCategoryWithMaxRunAndArtistIdVal(artistId, 'c', 'ac'),
      )
      .where('ac.artistId', artistId)
      .first();
  }

  getArtistBuzzChart(artistId: number) {
    return DailyScoresModel.query().alias('ds').where('ds.artistId', artistId);
  }

  getArtistTracks(artistId: number) {
    return SpotifyTrackModel.query()
      .alias('st')
      .leftJoinRelated(
        expr(
          [Relations.ArtistTracks, 'ast'],
          [Relations.AppleTrack, 'atr'],
          [Relations.Album, 'sal'],
        ),
      )
      .where('ast.artistId', artistId)
      .groupBy('st.trackKey');
  }

  getSpotifyArtistById(artistId: number) {
    return SpotifyArtistModel.query().alias('sa').where('sa.artistId', artistId).first();
  }

  getArtistsTotalBrackhitAppearances() {
    return BrackhitArtistsAppearancesModel.query()
      .alias('baa')
      .select('baa.artistId')
      .sum('baa.appearances as appearances')
      .groupBy('baa.artistId');
  }

  // the fastest method to join daily scores
  getArtistsMaxDateDailyScore() {
    const maxDate = DailyScoresModel.query()
      .select('artistId')
      .max('date as date')
      .groupBy('artistId');

    return DailyScoresModel.query()
      .alias('ds')
      .join(maxDate.as('sub'), function () {
        this.on('sub.artistId', 'ds.artistId').andOn('sub.date', 'ds.date');
      });
  }

  // the fastest method to join categories
  getArtistsMaxRunCategory() {
    const maxRun = ArtistCategoryModel.query()
      .select('artistId')
      .max('run as run')
      .groupBy('artistId');

    return ArtistCategoryModel.query()
      .alias('ac')
      .join(maxRun.as('sub'), function () {
        this.on('sub.artistId', 'ac.artistId').andOn('sub.run', 'ac.run');
      });
  }

  getFollowedArtists() {
    return UserFeedPreferencesModel.query()
      .alias('ufp')
      .select('*')
      .count('* as followCount')
      .groupBy('ufp.artistId');
  }

  getArtistsFollowedAfterDate(date: Date) {
    const followedArtists = this.getFollowedArtists().where('ufp.dateInserted', '>=', date);

    return ArtistModel.query().alias('a').join(followedArtists.as('fa'), 'fa.artistId', 'a.id');
  }
}
