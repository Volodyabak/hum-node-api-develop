import { Injectable } from '@nestjs/common';
import {
  ArtistBuzzDto,
  ArtistDto,
  ArtistProfileDto,
  ArtistReleaseBlurbDto,
  ArtistTrackDto,
  SearchedArtistDto,
} from '../dto/artists.dto';
import {
  GetArtistBlurbsQueryDto,
  GetArtistDefaultQueryDto,
  GetArtistDefaultResponseDto,
  GetArtistsQueryDto,
  GetArtistTracksQueryDto,
  SearchArtistQueryDto,
} from '../dto/api-dto/artist.api-dto';
import { JoinOperation, PaginatedItems } from '../../../Tools/dto/util-classes';
import { ArtistParser } from '../parsers/artist.parser';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import { ArtistModel, SpotifyArtistModel } from '../../../../database/Models';
import { QueryBuilder } from 'objection';
import { expr } from '../../../../database/relations/relation-builder';
import { Relations } from '../../../../database/relations/relations';
import {
  GET_ARTIST_BLURBS_DAYS_LIMIT,
  GET_ARTIST_BUZZ_CHART_DAYS_LIMIT,
} from '../constants/artist-constants';
import { DateUtils } from '../../../Tools/utils/date-utils';
import { ErrorConst } from '../../../constants';
import { NotFoundError } from '../../../Errors';
import { RepositoryService } from '../../repository/services/repository.service';
import { ConstantId } from '../../constants/constants';

@Injectable()
export class ArtistsService {
  constructor(private readonly repoService: RepositoryService) {}

  async getArtistById(artistId: number, userId: string): Promise<ArtistDto> {
    const artistsQB = this.repoService.artistRepo.getArtistsMeta(userId);
    artistsQB.select(
      'a.id',
      'a.facebookName',
      'a.imageFile',
      'sa.artistKey',
      'ds.direction',
      'ds.dailyPoints',
      'g.genreName',
      'c.category',
      'ufp.artistId as tokenUserArtistId',
    );

    const artist = await artistsQB.findById(artistId);

    if (!artist) {
      throw new NotFoundError(ErrorConst.ARTIST_NOT_FOUND);
    }

    return ArtistParser.parseArtist(artist);
  }

  async getArtists(userId: string, query: GetArtistsQueryDto): Promise<PaginatedItems<ArtistDto>> {
    const artistsQB = this.repoService.artistRepo.getArtistsMeta(userId);
    QueryBuilderUtils.addPaginationToBuilder(artistsQB, query);
    artistsQB
      .distinct(
        'a.id',
        'a.facebookName',
        'a.imageFile',
        'sa.artistKey',
        'ds.direction',
        'ds.dailyPoints',
        'g.genreName',
        'c.category',
        'ufp.artistId as tokenUserArtistId',
      )
      .orderBy('ds.dailyPoints', 'desc')
      .orderBy('ds.direction', 'desc')
      .orderBy('a.id', 'desc');

    const [artists, total] = await Promise.all([artistsQB, ArtistModel.query().resultSize()]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: ArtistParser.parseArtists(artists),
    };
  }

  async searchArtistsByName(
    userId: string,
    query: SearchArtistQueryDto,
  ): Promise<PaginatedItems<SearchedArtistDto>> {
    const artistsQB = this.repoService.artistRepo.searchArtistsByName(query.query);
    const totalQB = artistsQB.clone().resultSize();

    this.repoService.artistRepo.joinDailyScoreToArtistsQB(artistsQB, {
      from: 'a',
      to: 'ds',
      join: JoinOperation.leftJoin,
    });
    this.repoService.artistRepo.joinUserFeedToArtistsQB(artistsQB, userId);
    QueryBuilderUtils.addPaginationToBuilder(artistsQB, query);

    artistsQB
      .select(
        'a.id',
        'a.facebookName',
        'a.imageFile',
        'ds.dailyPoints',
        'ufp.artistId as tokenUserArtistId',
      )
      .orderBy('ds.dailyPoints', 'desc')
      .orderBy('ds.direction', 'desc')
      .orderBy('a.id', 'desc');

    const [artists, total] = await Promise.all([artistsQB, totalQB]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: ArtistParser.parseSearchedArtists(artists),
    };
  }

  async searchArtistsByGenreAndCategory(
    userId: string,
    query: SearchArtistQueryDto,
  ): Promise<PaginatedItems<ArtistProfileDto>> {
    let artistsQB: QueryBuilder<ArtistModel, ArtistModel[]>;
    const userFeedJoin = query.following ? JoinOperation.innerJoin : JoinOperation.leftJoin;

    if (query.genreId !== undefined && query.category !== undefined) {
      artistsQB = this.repoService.artistRepo.getArtistsByGenreAndCategory(
        query.genreId,
        query.category,
      );
    } else if (query.genreId !== undefined) {
      // TODO: temporary fix, remove later
      if ([0, 1].includes(query.genreId)) {
        artistsQB = this.repoService.artistRepo.getArtistsByGenre(7);
      } else {
        artistsQB = this.repoService.artistRepo.getArtistsByGenre(query.genreId);
      }
      this.repoService.artistRepo.joinCategoryToArtistsQB(artistsQB, {
        from: 'a',
        through: 'ac',
        to: 'c',
        join: JoinOperation.leftJoin,
      });
    } else if (query.category !== undefined) {
      artistsQB = this.repoService.artistRepo.getArtistsByCategory(query.category);
      artistsQB.leftJoinRelated(expr([Relations.Genre, 'g']));
    }

    this.repoService.artistRepo.joinUserFeedToArtistsQB(artistsQB, userId, {
      join: userFeedJoin,
    });

    const totalQB = artistsQB.clone().resultSize();

    this.repoService.artistRepo.joinDailyScoreToArtistsQB(artistsQB, {
      from: 'a',
      to: 'ds',
      join: JoinOperation.leftJoin,
    });
    QueryBuilderUtils.addPaginationToBuilder(artistsQB, query);

    artistsQB
      .select(
        'a.id',
        'a.facebookName',
        'a.imageFile',
        'sa.artistKey',
        'ds.direction',
        'ds.dailyPoints',
        'g.genreName',
        'c.category',
        'ufp.artistId as tokenUserArtistId',
      )
      .leftJoinRelated(expr([Relations.SpotifyArtist, 'sa']))
      .orderBy('ds.dailyPoints', 'desc')
      .orderBy('ds.direction', 'desc')
      .orderBy('a.id', 'desc');

    const [artists, total] = await Promise.all([artistsQB, totalQB]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: ArtistParser.parseArtistProfiles(artists),
    };
  }

  async getArtistReleaseBlurbs(
    artistId: number,
    query: GetArtistBlurbsQueryDto,
  ): Promise<PaginatedItems<ArtistReleaseBlurbDto>> {
    const date = new Date();
    const releasesQB = this.repoService.artistRepo
      .getArtistReleaseBlurbs(artistId)
      .whereBetween('sal.releaseDate', [
        DateUtils.subtractDaysFromDate(date, GET_ARTIST_BLURBS_DAYS_LIMIT),
        date,
      ]);
    const totalQB = releasesQB.resultSize();

    QueryBuilderUtils.addPaginationToBuilder(releasesQB, query);

    releasesQB
      .select('sal.albumKey', 'sal.releaseDate', 'sal.albumImage', 'sal.name')
      .orderBy('sal.releaseDate', 'desc');

    const [releases, total] = await Promise.all([releasesQB, totalQB]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: ArtistParser.parseArtistReleaseBlurbs(releases, total),
    };
  }

  async getArtistCategory(artistId: number): Promise<any> {
    return this.repoService.artistRepo
      .getArtistCategory(artistId)
      .select('c.category', 'ac.artistId', 'ac.categoryId');
  }

  async getArtistBuzzChartFull(artistId: number): Promise<ArtistBuzzDto[]> {
    const date = new Date();

    return this.repoService.artistRepo
      .getArtistBuzzChart(artistId)
      .select('ds.dailyPoints as buzzPoints', 'ds.artistId', 'ds.date')
      .where(
        'ds.date',
        '>=',
        DateUtils.subtractDaysFromDate(date, GET_ARTIST_BUZZ_CHART_DAYS_LIMIT),
      )
      .orderBy('ds.date', 'desc')
      .castTo<ArtistBuzzDto[]>();
  }

  async getArtistTracks(
    artistId: number,
    query: GetArtistTracksQueryDto,
  ): Promise<PaginatedItems<ArtistTrackDto>> {
    const tracksQB = this.repoService.artistRepo.getArtistTracks(artistId);
    const totalQB = tracksQB.resultSize();

    QueryBuilderUtils.addPaginationToBuilder(tracksQB, query);

    tracksQB
      .select(
        'st.trackKey',
        'st.trackName',
        'st.trackPreview',
        'atr.trackPreview as appleTrackPreview',
        'sal.albumImage',
      )
      .orderBy('ast.rank');

    const [tracks, total] = await Promise.all([tracksQB, totalQB]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: ArtistParser.parseArtistTracks(tracks),
    };
  }

  async getSpotifyArtist(artistId: number): Promise<SpotifyArtistModel> {
    return this.repoService.artistRepo.getSpotifyArtistById(artistId).select('*');
  }

  async getDefaultArtists(query: GetArtistDefaultQueryDto): Promise<GetArtistDefaultResponseDto> {
    const constant = await this.repoService.constantsRepo.getConstant(
      ConstantId.DEFAULT_ARTISTS_TIMEFRAME,
    );
    const timeframe = DateUtils.subtractDaysFromDate(query.date, constant.value);
    const artistsQB = this.repoService.artistRepo.getArtistsFollowedAfterDate(timeframe);
    const totalQB = artistsQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(artistsQB, query);
    artistsQB
      .select('a.id', 'a.facebookName', 'a.imageFile', 'fa.followCount')
      .orderBy('fa.followCount', 'desc')
      .orderBy('a.facebookName');

    const [artists, total] = await Promise.all([artistsQB, totalQB]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      artists: artists.map((el) => ArtistParser.parseDefaultArtist(el)),
    };
  }
}
