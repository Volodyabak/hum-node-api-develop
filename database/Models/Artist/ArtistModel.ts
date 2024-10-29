import { Model } from 'objection';
import { GenreModel } from './GenreModel';
import { UserFeedPreferencesModel } from '../User';
import { SpotifyAlbumModel, SpotifyArtistModel } from '../Spotify';
import { YoutubeVideoModel } from './YoutubeVideoModel';
import { NewsFeedItemModel } from './NewsFeedItemModel';
import { TwitterPostModel } from './TwitterPostModel';
import { ArtistTwitterProfileModel } from './ArtistTwitterProfileModel';
import { BrackhitContentModel } from '../Brackhit/BrackhitContentModel';
import { Relations } from '../../relations/relations';
import { NO_PROFILE_ARTIST_IMAGE } from '../../../src/api-model-examples';
import { ArtistGenreModel } from './ArtistGenreModel';
import { ApiProperty } from '@nestjs/swagger';
import { TicketmasterEventModel } from '../../../src/modules/events/models/ticketmaster-event.model';
import { TicketmasterArtistEventModel } from '../../../src/modules/events/models/ticketmaster-artist-event.model';

export class ArtistModel extends Model {
  @ApiProperty()
  id: number;
  facebookName: string;
  @ApiProperty()
  name: string;
  imageFile: string;
  @ApiProperty()
  image: string;
  artistKey: string;
  direction: -1 | 0 | 1;
  dailyPoints: number;
  genreId: number;
  genreName: string;
  tokenUserArtistId: string;
  category: string;

  artistId: number;
  isActive: number;
  facebookUserid: string;
  fbAuthtoken: string;
  facebookTown: string;
  facebookGenre: string;
  facebookLabel: string;
  soloArtist: number;
  city: string;
  stateId: number;
  countryId: number;
  labelTypeId: number;
  verified: number;
  dateInserted: Date;
  contactEmail: string;
  lastUpdate: Date;
  label1: string;
  label2: string;
  label3: string;
  spotifyArtistkey: string;
  rank: number;
  followCount: number;

  public events?: TicketmasterEventModel[];
  genre?: GenreModel;
  genres?: GenreModel[];
  spotifyArtist?: SpotifyArtistModel;

  static get tableName() {
    return 'ean_collection.artist';
  }

  static get idColumn() {
    return 'id';
  }

  static getTableNameWithAlias(alias: string = 'a'): string {
    return ArtistModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      [Relations.Genre]: {
        relation: Model.HasOneThroughRelation,
        modelClass: GenreModel,
        join: {
          from: 'ean_collection.artist.id',
          through: {
            modelClass: ArtistGenreModel,
            from: 'ean_collection.artist_genre.artist_id',
            to: 'ean_collection.artist_genre.genre_id',
          },
          to: 'ean_collection.genre.genre_id',
        },
      },

      [Relations.Genres]: {
        relation: Model.ManyToManyRelation,
        modelClass: GenreModel,
        join: {
          from: `${ArtistModel.tableName}.${ArtistModel.idColumn}`,
          through: {
            modelClass: ArtistGenreModel,
            from: `${ArtistGenreModel.tableName}.artist_id`,
            to: `${ArtistGenreModel.tableName}.genre_id`,
          },
          to: `${GenreModel.tableName}.genre_id`,
        },
      },

      [Relations.UserFeed]: {
        relation: Model.HasManyRelation,
        modelClass: UserFeedPreferencesModel,
        join: {
          from: 'ean_collection.artist.id',
          to: 'labl.user_feed_preferences.artistId',
        },
      },

      [Relations.ArtistGenre]: {
        relation: Model.HasOneRelation,
        modelClass: ArtistGenreModel,
        join: {
          from: 'ean_collection.artist.id',
          to: 'ean_collection.artist_genre.artistId',
        },
      },

      [Relations.SpotifyArtist]: {
        relation: Model.HasOneRelation,
        modelClass: SpotifyArtistModel,
        join: {
          from: 'ean_collection.artist.id',
          to: 'ean_collection.spotify_artist.artistId',
        },
      },

      spotifyAlbums: {
        relation: Model.ManyToManyRelation,
        modelClass: SpotifyAlbumModel,
        join: {
          from: 'ean_collection.artist.id',
          through: {
            from: 'ean_collection.spotify_album_artist.artistId',
            to: 'ean_collection.spotify_album_artist.albumId',
          },
          to: 'ean_collection.spotify_album.id',
        },
      },

      youtubeVideos: {
        relation: Model.ManyToManyRelation,
        modelClass: YoutubeVideoModel,
        join: {
          from: 'ean_collection.artist.id',
          through: {
            from: 'ean_collection.youtube_artist_video.artistId',
            to: 'ean_collection.youtube_artist_video.youtubeVideoId',
          },
          to: 'ean_collection.youtube_video.id',
        },
      },

      newsFeedItems: {
        relation: Model.ManyToManyRelation,
        modelClass: NewsFeedItemModel,
        join: {
          from: 'ean_collection.artist.id',
          through: {
            from: 'ean_collection.artist_news_item.artistId',
            to: 'ean_collection.artist_news_item.newsFeedItemId',
          },
          to: 'ean_collection.news_feed_item.id',
        },
      },

      twitterProfile: {
        relation: Model.HasOneRelation,
        modelClass: ArtistTwitterProfileModel,
        join: {
          from: 'ean_collection.artist.id',
          to: 'ean_collection.artist_twitter_profile.artistId',
        },
      },

      twitterPosts: {
        relation: Model.ManyToManyRelation,
        modelClass: TwitterPostModel,
        join: {
          from: 'ean_collection.artist.id',
          through: {
            from: 'ean_collection.twitter_artist_post.artistId',
            to: 'ean_collection.twitter_artist_post.postId',
          },
          to: 'ean_collection.twitter_post.postId',
        },
      },

      [Relations.Content]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: 'ean_collection.artist.id',
          to: 'labl.brackhit_content.contentId',
        },
      },

      [Relations.TicketmasterEvents]: {
        relation: Model.ManyToManyRelation,
        modelClass: TicketmasterEventModel,
        join: {
          from: 'ean_collection.artist.id',
          through: {
            modelClass: TicketmasterArtistEventModel,
            from: 'ean_collection.ticketmaster_artist_event.artistId',
            to: 'ean_collection.ticketmaster_artist_event.eventId',
          },
          to: 'ean_collection.ticketmaster_event.id',
        },
      },
    };
  }

  $afterFind() {
    const artistImageColumnNames = ['imageFile', 'artistImage', 'image'];

    artistImageColumnNames.forEach((columnName) => {
      if (this[columnName] === undefined) return;

      if (this[columnName] === null) {
        this[columnName] = NO_PROFILE_ARTIST_IMAGE;
      } else if (!this[columnName]?.startsWith('http')) {
        this[columnName] = 'https://emergingartistnetwork.com/images/'.concat(this[columnName]);
      }
    });
  }
}
