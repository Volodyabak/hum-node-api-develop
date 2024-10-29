import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { FeedSourceModel } from './FeedSourceModel';
import { ArtistModel } from './ArtistModel';
import { DateUtils } from '../../../src/Tools/utils/date-utils';

export class ArtistFeedModel extends Model {
  id: number;
  feedSource: number;
  feedType: number;
  sourceId: number;
  artistId: number;
  artistName: string;
  artistImage: string;
  timestamp: Date;

  static get tableName() {
    return 'ean_collection.artist_feed';
  }

  static get idColumn() {
    return 'id';
  }

  static getTableNameWithAlias(alias: string = 'af'): string {
    return ArtistFeedModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      [Relations.FeedSource]: {
        relation: Model.HasOneRelation,
        modelClass: FeedSourceModel,
        join: {
          from: 'ean_collection.artist_feed.feedSource',
          to: 'ean_collection.feed_source.id',
        },
      },
      [Relations.Artist]: {
        relation: Model.HasOneRelation,
        modelClass: ArtistModel,
        join: {
          from: 'ean_collection.artist_feed.artistId',
          to: 'ean_collection.artist.id',
        },
      },
    };
  }

  static get rawSql() {
    return {
      generateRandomTimestampForReleases(date: Date, alias: string): string {
        const seconds = DateUtils.timeToSeconds(date);

        return `IF(feed_type = 1,
        ADDTIME(${alias}.timestamp, SEC_TO_TIME(RAND() * ${seconds})),
        ${alias}.timestamp) as timestamp`;
      },
    };
  }
}
