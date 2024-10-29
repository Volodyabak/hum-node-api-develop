import { Model } from 'objection';
import {
  BrackhitAdsModel,
  BrackhitDailyModel,
  BrackhitTagModel,
  BrackhitTagTypeModel,
  BrackhitTypeModel,
} from './Brackhit';
import { GenreModel } from './GenreModel';
import { BrackhitGenreModel } from './BrackhitGenreModel';
import { BrackhitUserChoicesModel } from './BrackhitUserChoicesModel';
import { BrackhitUserModel } from './BrackhitUserModel';
import { AWSUsersModel, UserProfileInfoModel } from './User';
import { BrackhitMatchupsModel } from './BrackhitMatchupsModel';
import { BrackhitResultsModel } from './BrackhitResultsModel';
import { AppSettingsService } from '../../src/Services/AppSettings/AppSettingsService';
import { DEFAULT_BRACKHIT_IMAGE } from '../../src/constants';
import { BrackhitContentModel } from './Brackhit/BrackhitContentModel';
import { ArtistModel } from './Artist';
import { BrackhitArtistModel } from './BrackhitArtistModel';
import { FeedItemBaseModel } from './FeedItemBaseModel';
import {
  BrackhitType,
  BrackhitUserStatus,
} from '../../src/modules/brackhits/constants/brackhits.constants';
import { Relations } from '../relations/relations';
import { BrackhitSortingModel } from './Brackhit/BrackhitSortingModel';
import { ApiProperty } from '@nestjs/swagger';
import { DATE_EXAMPLE, MODEL_ID, UUID_V4 } from '../../src/api-model-examples';
import { BrackhitDefaultSuggestionsModel } from './Brackhit/BrackhitDefaultSuggestionsModel';
import { BrackhitsUtils } from '../../src/modules/brackhits/utils/brackhits.utils';

export enum BRACKHIT_SORTING_ID {
  DEFAULT = 1,
  PLAYLIST_ORDER = 2,
  CUSTOM = 3,
  PLAYLIST_POSITION = 4,
}

export enum BRACKHIT_SORTING {
  DEFAULT = 'DEFAULT',
  PLAYLIST_ORDER = 'PLAYLIST_ORDER',
  CUSTOM = 'CUSTOM',
  PLAYLIST_POSITION = 'PLAYLIST_POSITION',
}

export class BrackhitModel extends FeedItemBaseModel {
  @ApiProperty({ example: MODEL_ID })
  brackhitId: number;
  @ApiProperty()
  typeId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty({ example: UUID_V4 })
  ownerId: string;
  @ApiProperty({ example: DATE_EXAMPLE })
  timeLive: Date;
  @ApiProperty()
  duration: number;
  @ApiProperty()
  size: number;
  @ApiProperty()
  thumbnail: string;
  @ApiProperty()
  url: string;
  @ApiProperty()
  playlistId: number;
  @ApiProperty()
  playlistKey: string;
  @ApiProperty()
  category: number;
  @ApiProperty()
  displaySeeds: 0 | 1;
  @ApiProperty()
  thirdPlace: 0 | 1;
  @ApiProperty()
  startingRound: number;
  @ApiProperty()
  featured: number;
  @ApiProperty()
  scoringState: number;
  @ApiProperty()
  hidden: number;
  @ApiProperty({ example: DATE_EXAMPLE })
  createdAt: Date;
  @ApiProperty({ example: DATE_EXAMPLE })
  updatedAt: Date;

  detail: string;
  link: string;

  similarity: number;
  userStatus: BrackhitUserStatus;
  isLive: 0 | 1;
  isComplete: boolean | number;
  isCompleted: number; // for brackhit hub service since isComplete: boolean property is already in use
  lastChoiceTime: Date;
  sortingId: number;
  type: BrackhitType;
  completions: number;

  owner?: UserProfileInfoModel;
  matchups: BrackhitMatchupsModel[];
  results: BrackhitResultsModel[];
  sorting?: BrackhitSortingModel;
  centralId?: number;

  static get tableName() {
    return 'labl.brackhit';
  }

  static get idColumn() {
    return 'brackhitId';
  }

  static get relationMappings() {
    // const { UserProfileInfoModel } = require('./UserProfileInfoModel');
    // const { BrackhitUserModel } = require('./BrackhitUserModel');

    return {
      [Relations.BrackhitAds]: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitAdsModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_ads.brackhitId',
        },
      },

      [Relations.DailyBrackhit]: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitDailyModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_daily.brackhitId',
        },
      },

      [Relations.Type]: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitTypeModel,
        join: {
          from: 'labl.brackhit.typeId',
          to: 'labl.brackhit_type.typeId',
        },
      },

      [Relations.BrackhitUser]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitUserModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_user.brackhitId',
        },
      },

      [Relations.SuggestionParent]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitDefaultSuggestionsModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_default_suggestions.brackhitId',
        },
      },

      [Relations.SuggestionChild]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitDefaultSuggestionsModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_default_suggestions.suggestedBrackhitId',
        },
      },

      [Relations.BrackhitGenres]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitGenreModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_genre.brackhitId',
        },
      },

      [Relations.Genre]: {
        relation: Model.ManyToManyRelation,
        modelClass: GenreModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          through: {
            modelClass: BrackhitGenreModel,
            from: 'labl.brackhit_genre.brackhitId',
            to: 'labl.brackhit_genre.genreId',
          },
          to: 'ean_collection.genre.genreId',
        },
      },

      users: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitUserModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_user.brackhitId',
        },
      },

      userProfiles: {
        relation: Model.ManyToManyRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          through: {
            modelClass: BrackhitUserModel,
            from: 'labl.brackhit_user.brackhitId',
            to: 'labl.brackhit_user.userId',
          },
          to: 'labl.user_profile_info.userId',
        },
      },

      usersChoices: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitUserChoicesModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_user_choices.brackhitId',
        },
      },

      [Relations.Owner]: {
        relation: Model.HasOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.brackhit.ownerId',
          to: 'labl.user_profile_info.userId',
        },
      },

      [Relations.AwsUser]: {
        relation: Model.HasOneRelation,
        modelClass: AWSUsersModel,
        join: {
          from: 'labl.brackhit.ownerId',
          to: 'ean_collection.aws_users.sub',
        },
      },

      [Relations.BrackhitTags]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitTagModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_tag.brackhitId',
        },
      },

      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: BrackhitTagTypeModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          through: {
            modelClass: BrackhitTagModel,
            from: 'labl.brackhit_tag.brackhitId',
            to: 'labl.brackhit_tag.tagId',
          },
          to: 'labl.brackhit_tag_type.tag_id',
        },
      },

      [Relations.Matchups]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitMatchupsModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_matchups.brackhitId',
        },
      },

      [Relations.Content]: {
        relation: Model.ManyToManyRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          through: {
            modelClass: BrackhitMatchupsModel,
            from: 'labl.brackhit_matchups.brackhitId',
            to: 'labl.brackhit_matchups.choiceId',
          },
          to: 'labl.brackhit_content.choiceId',
        },
      },

      results: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitResultsModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_results.brackhitId',
        },
      },

      artists: {
        relation: Model.ManyToManyRelation,
        modelClass: ArtistModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          through: {
            modelClass: BrackhitArtistModel,
            from: 'labl.brackhit_artists.brackhitId',
            to: 'labl.brackhit_artists.artistId',
          },
          to: 'ean_collection.artist.id',
        },
      },

      [Relations.BrackhitArtists]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitArtistModel,
        join: {
          from: 'labl.brackhit.brackhitId',
          to: 'labl.brackhit_artists.brackhitId',
        },
      },

      [Relations.Sorting]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitSortingModel,
        join: {
          from: 'labl.brackhit.sortingId',
          to: 'labl.brackhit_sorting.id',
        },
      },
    };
  }

  static get rawSql() {
    return {
      selectIsLive(userTime: Date, alias = 'b') {
        return `${userTime.toISOString()} BETWEEN ${alias}.time_live AND DATE_ADD(${alias}.time_live, INTERVAL ${alias}.duration HOUR) as isLive`;
      },
      whereQueryLike(query: string, alias: string) {
        const escapedQuery = query.replace(/'/g, "\\'").replace(/"/g, '\\"');
        return `concat(${alias}.name, COALESCE(${alias}.detail, '')) like \'%${escapedQuery}%\'`;
      },
    };
  }

  async $afterFind() {
    // todo: rewrite AppSetting service with NestJS
    const settings = await AppSettingsService.getAppSettingsState();

    if (!settings.showAlbumImages) {
      this.thumbnail = DEFAULT_BRACKHIT_IMAGE;
    }

    // TODO: remove when url column in table will be populated
    if (this.url !== undefined) {
      this.url = this.brackhitId ? BrackhitsUtils.getBrackhitUrl(this.brackhitId) : null;
    }

    this.description = this.detail || '';
    this.url = this.link;
  }

  async $beforeInsert() {
    if (this.description) {
      this.detail = this.description;
    }
    if (this.url) {
      this.link = this.url;
    }
    this.description = undefined;
    this.url = undefined;
  }

  async $beforeUpdate() {
    if (this.description) {
      this.detail = this.description;
    }
    if (this.url) {
      this.link = this.url;
    }
    this.description = undefined;
    this.url = undefined;
  }
}
