import { Model } from 'objection';
import { ArtistModel } from '../Artist';
import { Relations } from '../../relations/relations';
import { SpotifyArtistModel } from '../Spotify';
import { ApiProperty } from '@nestjs/swagger';

export class UserFeedPreferencesModel extends Model {
  @ApiProperty()
  artistId: number;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  videoFlag: number;
  @ApiProperty()
  tweetFlag: number;
  @ApiProperty()
  newsFlag: number;
  @ApiProperty()
  artistCount: number;

  static get tableName() {
    return 'labl.user_feed_preferences';
  }

  static getTableNameWithAlias(alias: string = 'ufp'): string {
    return UserFeedPreferencesModel.tableName.concat(' as ', alias);
  }

  static get idColumn() {
    return ['artistId', 'userId'];
  }

  static get relationMappings() {
    return {
      artists: {
        relation: Model.HasOneRelation,
        modelClass: ArtistModel,
        join: {
          from: 'labl.user_feed_preferences.artistId',
          to: 'ean_collection.artist.id',
        },
      },

      [Relations.SpotifyArtist]: {
        relation: Model.HasOneRelation,
        modelClass: SpotifyArtistModel,
        join: {
          from: 'labl.user_feed_preferences.artistId',
          to: 'ean_collection.spotify_artist.artistId',
        },
      },
    };
  }

  static get callbacks() {
    return {
      onArtistIdAndUserIdVal(userId: string, from: string, to: string) {
        return function () {
          this.on(`${to}.artistId`, `${from}.id`).andOnVal(`${to}.userId`, userId);
        };
      },
    };
  }
}
