import { ArtistFeedModel, ArtistFeedTestModel } from '../../../../database/Models';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginatedItems } from '../../../Tools/dto/util-classes';
import { GetArtistFeedQueryDto } from '../../artists/dto/api-dto/artist.api-dto';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import { RepositoryService } from '../../repository/services/repository.service';
import { raw } from 'objection';
import { GetFeedQueryDto } from '../dto/api-dto/feed.api-dto';
import { FeedSources } from '../constants/feed.constants';
import { FeedParser } from '../parsers/feed.parser';
import { ArtistoryNewsFeedItem, FeedItemSource } from '../interfaces/feed.interfaces';
import { FeedItemDto } from '../dto/feed.dto';
import { ErrorConst } from '../../../constants';
import { ConstantId } from '../../constants/constants';
import { InteractionTypes } from '../../analytics/constants';
import { DateQueryDto } from '../../../Tools/dto/main-api.dto';

@Injectable()
export class FeedService {
  constructor(private readonly repoService: RepositoryService) {}

  async getArtistFeedItem(centralId: number, userId: string, query: DateQueryDto) {
    const itemQB = this.repoService.feedRepo.getArtistFeedItem(centralId);
    this.repoService.feedRepo.joinFeedMetaToBuilder(itemQB, query.date);

    const item = await itemQB;

    return this.fetchSourceToFeedItemV2(item, userId);
  }

  async getArtistFeedV2(userId: string, query: GetFeedQueryDto): Promise<any> {
    const artistFeedQB = this.repoService.feedRepo.getUserArtistFeedV2(userId);
    const totalQB = artistFeedQB.clone().resultSize();

    this.repoService.feedRepo.joinFeedMetaToBuilder(artistFeedQB, query.date);
    QueryBuilderUtils.addPaginationToBuilder(artistFeedQB, query);

    artistFeedQB.orderBy('timestamp', 'desc');

    const [artistoryNews, artistFeed, total] = await Promise.all([
      this.getArtistoryNewsV2(query),
      artistFeedQB,
      totalQB,
    ]);
    const feedItems = await Promise.all(
      artistFeed.map((item) => this.fetchSourceToFeedItemV2(item, userId)),
    );

    if (artistoryNews && artistoryNews.length > 0) {
      feedItems.unshift(...artistoryNews);
    }

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: feedItems,
    };
  }

  async getArtistFeedV1(
    userId: string,
    query: GetArtistFeedQueryDto,
  ): Promise<PaginatedItems<ArtistFeedModel>> {
    const feedQB = this.repoService.feedRepo.getUserArtistFeedV1(userId);
    const totalQB = feedQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(feedQB, query);
    feedQB
      .select(
        'fs.feedType',
        'af.feedSource',
        'af.sourceId',
        raw(ArtistFeedModel.rawSql.generateRandomTimestampForReleases(query.date, 'af')),
        'af.artistId',
        'a.facebookName as artistName',
        'a.imageFile as artistImage',
      )
      .orderBy('timestamp', 'desc');

    const [artistoryNews, feed, total] = await Promise.all([
      this.getArtistoryNews(query),
      feedQB,
      totalQB,
    ]);
    const sourceFeed = await Promise.all(feed.map((item) => this.fetchSourceToFeedV1(item)));

    if (artistoryNews && artistoryNews.length > 0) {
      sourceFeed.unshift(...artistoryNews);
    }

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: sourceFeed,
    };
  }

  async fetchSourceToFeedV1<T extends ArtistFeedModel>(item: ArtistFeedModel): Promise<T> {
    let source: any;

    if (item.feedSource === FeedSources.SpotifyAlbum) {
      source = await this.repoService.feedRepo.getFeedSpotifyAlbum(item.sourceId);
    } else if (item.feedSource === FeedSources.News) {
      source = await this.repoService.feedRepo.getFeedNewsItem(item.sourceId);
    } else if (item.feedSource === FeedSources.YoutubeVideo) {
      source = await this.repoService.feedRepo.getFeedYoutubeVideo(item.sourceId);
    } else if (item.feedSource === FeedSources.Brackhit) {
      source = await this.repoService.feedRepo.getFeedBrackhit(item.sourceId);
    }

    return {
      feedType: item.feedType,
      timestamp: item.timestamp,
      artistId: item.artistId,
      artistName: item.artistName,
      artistImage: item.artistImage,
      ...source,
    };
  }

  async fetchSourceToFeedItemV2(item: ArtistFeedTestModel, userId: string): Promise<FeedItemDto> {
    const [source, itemLikeLog] = await Promise.all([
      this.getFeedItemSourceV2(item),
      this.repoService.analyticsRepo.findContentLog({
        userId,
        centralId: item.centralId,
        interactionId: InteractionTypes.Like,
      }),
    ]);

    return {
      feedType: item.feedType,
      centralId: item.centralId,
      timestamp: item.timestamp,
      artist: item.artist,
      source,
      liked: itemLikeLog ? 1 : 0,
    };
  }

  async getArtistoryNews(query: GetArtistFeedQueryDto): Promise<ArtistFeedModel[]> {
    if (query.skip !== 0) return undefined;

    return this.repoService.feedRepo
      .getArtistoryNewsFeed()
      .select(
        raw('4 as feedType'),
        'nfi.feedTimestamp as timestamp',
        raw('null as artistId'),
        'nf.feedSource as artistName',
        'nf.feedIcon as artistImage',
        'nfi.id as newsItemId',
        'nfi.newsFeedId',
        'nfi.title',
        'nfi.link',
        'nfi.detail as description',
        'nfi.image as newsImage',
      )
      .orderBy('nfi.feedTimestamp', 'desc')
      .castTo<ArtistFeedModel[]>();
  }

  async getArtistoryNewsV2(query: GetFeedQueryDto): Promise<FeedItemDto[]> {
    // artistory news are only appended at the beginning of feed
    if (query.skip !== 0) return undefined;

    const artistoryNews = await this.repoService.feedRepo
      .getArtistoryNewsFeedV2()
      .select(
        'af.centralId',
        'af.timestamp',
        raw('null as artistId'),
        'cf:nfi:nf.feedSource',
        'cf:nfi:nf.feedIcon',
        'cf:nfi.title',
        'cf:nfi.link',
        'cf:nfi.detail as description',
        'cf:nfi.image',
      )
      .orderBy('af.timestamp', 'desc')
      .castTo<ArtistoryNewsFeedItem[]>();

    return artistoryNews.map((el) => FeedParser.parseArtistoryNewsItem(el));
  }

  async getFeedItemSourceV2(item: ArtistFeedTestModel): Promise<FeedItemSource> {
    if (item.feedSource === FeedSources.SpotifyAlbum) {
      return this.repoService.feedRepo.getFeedSpotifyAlbumV2(item.sourceId);
    } else if (item.feedSource === FeedSources.News) {
      return this.repoService.feedRepo.getFeedNewsItemV2(item.sourceId);
    } else if (item.feedSource === FeedSources.YoutubeVideo) {
      return this.repoService.feedRepo.getFeedYoutubeVideo(item.sourceId);
    } else if (item.feedSource === FeedSources.Brackhit) {
      return this.repoService.feedRepo.getFeedBrackhitV2(item.sourceId);
    }
  }

  async getRecommendedArtists(userId: string) {
    const userArtists = await this.repoService.userRepo.getUserFeedPreferences(userId);
    if (userArtists.length === 0) {
      throw new BadRequestException(ErrorConst.USER_DOES_NOT_FOLLOW_ARTISTS);
    }

    const limitConst = await this.repoService.constantsRepo.getConstant(
      ConstantId.FEED_RECOMMENDED_ARTISTS_COUNT,
    );

    return this.repoService.userRepo
      .getUserRecommendedArtists(userId)
      .select('a.id', 'a.facebookName as name', 'a.imageFile as image')
      .orderBy('rec.position', 'desc')
      .limit(limitConst.value);
  }
}
