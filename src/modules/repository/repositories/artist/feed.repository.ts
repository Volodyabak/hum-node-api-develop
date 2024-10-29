import { Injectable } from '@nestjs/common';
import {
  ArtistFeedModel,
  ArtistFeedTestModel,
  CentralFeedModel,
  NewsFeedItemModel,
  NewsFeedModel,
  SpotifyAlbumModel,
  YoutubeVideoModel,
} from '../../../../../database/Models';
import { BrackhitModel } from '../../../../../database/Models/BrackhitModel';
import { expr } from '../../../../../database/relations/relation-builder';
import { Relations } from '../../../../../database/relations/relations';
import { NewsFeeds } from '../../../feed/constants/feed.constants';
import { PartialModelObject, QueryBuilder, raw } from 'objection';
import { QueryBuilderUtils } from '../../../../Tools/utils/query-builder.utils';

@Injectable()
export class FeedRepository {
  getFeedNewsItem(id: number) {
    return NewsFeedItemModel.query()
      .alias('nfi')
      .select(
        'nfi.id as newsItemId',
        'nfi.newsFeedId',
        'nfi.title',
        'nfi.link',
        'nfi.detail as description',
        'nfi.image as newsImage',
      )
      .findById(id);
  }

  getFeedNewsItemV2(id: number) {
    return NewsFeedItemModel.query()
      .alias('nfi')
      .select('nfi.title', 'nfi.link', 'nfi.detail as description', 'nfi.image')
      .findById(id);
  }

  getFeedBrackhit(id: number) {
    return BrackhitModel.query()
      .alias('b')
      .select('b.brackhitId', 'b.name as brackhitName', 'b.thumbnail', 'b.ownerId', 'b.link')
      .findById(id);
  }

  getFeedBrackhitV2(id: number) {
    return BrackhitModel.query()
      .alias('b')
      .select('b.brackhitId', 'b.name', 'b.thumbnail as image', 'b.link')
      .findById(id);
  }

  getFeedSpotifyAlbum(id: number) {
    return SpotifyAlbumModel.query()
      .alias('s_al')
      .select('s_al.albumKey', 's_al.name as albumName', 's_al.albumImage')
      .findById(id);
  }

  getFeedSpotifyAlbumV2(id: number) {
    return SpotifyAlbumModel.query()
      .alias('s_al')
      .select('s_al.albumKey', 's_al.name as albumName', 's_al.albumImage as image')
      .findById(id);
  }

  getFeedYoutubeVideo(id: number) {
    return YoutubeVideoModel.query()
      .alias('yv')
      .select('yv.youtubeKey as videoKey', 'yv.videoTitle')
      .findById(id);
  }

  getUserArtistFeedV1(userId: string) {
    return ArtistFeedModel.query()
      .alias('af')
      .joinRelated(
        expr([Relations.FeedSource, 'fs'], [Relations.Artist, 'a', [Relations.UserFeed, 'ufp']]),
      )
      .where('a:ufp.userId', userId);
  }

  getArtistoryNewsFeed() {
    return NewsFeedModel.query()
      .alias('nf')
      .joinRelated(expr([Relations.NewsFeedItem, 'nfi']))
      .where('nf.id', NewsFeeds.Artistory)
      .where('nf.isActive', 1);
  }

  getArtistoryNewsFeedV2() {
    return ArtistFeedTestModel.query()
      .alias('af')
      .joinRelated(
        expr([
          Relations.CentralFeed,
          'cf',
          [Relations.NewsFeedItem, 'nfi', [Relations.NewsFeed, 'nf']],
        ]),
      )
      .where('cf:nfi:nf.id', NewsFeeds.Artistory)
      .where('cf:nfi:nf.isActive', 1);
  }

  getArtistFeed() {
    return ArtistFeedTestModel.query()
      .alias('af')
      .joinRelated(expr([Relations.CentralFeed, 'cf', [Relations.FeedSource, 'fs']]));
  }

  getUserArtistFeedV2(userId: string) {
    return this.getArtistFeed()
      .joinRelated(expr([Relations.UserFeed, 'ufp']))
      .where('ufp.userId', userId);
  }

  getArtistFeedItem(centralId: number) {
    return this.getArtistFeed().findOne('af.centralId', centralId);
  }

  createCentralFeedItem(data: PartialModelObject<CentralFeedModel>) {
    return CentralFeedModel.query().insert(data);
  }

  findCentralFeedItem(data: PartialModelObject<CentralFeedModel>) {
    return CentralFeedModel.query().alias('cf').findOne(data);
  }

  joinFeedMetaToBuilder(builder: QueryBuilder<any, any>, date: Date) {
    QueryBuilderUtils.fetchRelationsToBuilder(builder, [
      {
        select: ['a.id', 'a.facebookName as name', 'a.imageFile as image'],
        alias: 'a',
        relation: Relations.Artist,
      },
    ]);

    builder.select(
      'af.centralId',
      'cf:fs.feedType',
      'cf.feedSource',
      'cf.sourceId',
      raw(ArtistFeedTestModel.rawSql.getFeedItemTimestamp(date, 'af')),
    );
  }
}
