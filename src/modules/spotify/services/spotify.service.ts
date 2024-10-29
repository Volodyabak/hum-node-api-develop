import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { v4 } from 'uuid';

import {
  MAX_PLAYLIST_SIZE,
  MIN_PLAYLIST_SIZE,
  PLAYLIST_DEFAULT_IMAGE_KEY,
  SpotifyPlaylistSort,
} from '../constants';
import { SpotifySdk } from './spotify.sdk';
import { DEFAULT_USER_IMAGE, ErrorConst } from '../../../constants';
import { PlaylistService } from './playlist.service';
import {
  GetPlaylistResponseDto,
  PostCodeExchangeDto,
  PostPlaylistBodyDto,
  PostPlaylistResponseDto,
  SpotifyCodeExchangeResponseDto,
} from '../dto/spotify-api.dto';
import { S3Service } from '../../aws/services/s3.service';
import { SpotifyParser } from '../parsers/spotify.parser';
import { SpotifyTrackModel } from '@database/Models';
import { RepositoryService } from '../../repository/services/repository.service';
import { SpotifyClient } from './spotify.client';
import { SpotifyUserAccessData } from '../interfaces/spotify-user.interface';
import { SpotifyUtils } from '../utils/spotify.utils';
import { GetUserSpotifyPlaylistsQueryDto } from '../../users/dto/users-api.dto';
import { PaginatedItems } from '../../../Tools/dto/util-classes';
import { SpotifyUserPlaylistsDto } from '../dto/spotify.dto';
import { GET_USER_SPOTIFY_TRACKS_TAKE_DEFAULT } from '../../users/constants';
import { ConstantId } from '../../constants/constants';
import { generateUniqueUsername } from '../../../Tools';
import { CampaignsSpotifyUserTokensModel } from '@database/Models/campaign/campaigns-spotify-user-tokens.model';
import { AppEventsEmitter } from '../../app-events/app-events.emitter';
import { AppEventName } from '../../app-events/app-events.types';

@Injectable()
export class SpotifyService {
  constructor(
    private readonly spotifySdk: SpotifySdk,
    private readonly spotifyClient: SpotifyClient,
    private readonly playlistService: PlaylistService,
    private readonly repositoryService: RepositoryService,
    private readonly s3Service: S3Service,
    private readonly eventEmitter: AppEventsEmitter,
  ) {}

  async codeExchange(body: PostCodeExchangeDto): Promise<SpotifyCodeExchangeResponseDto> {
    const res = await this.spotifySdk.exchangeCode(body.code, body.redirectUri);

    if (body.saveTokens) {
      this.spotifySdk.setAccessToken(res.accessToken);
      const me = await this.spotifySdk.getMe();
      let campaignUser = await this.repositoryService.campaign.findCampaignUser({
        email: me.email,
      });
      if (!campaignUser) {
        const awsUser = await this.repositoryService.userRepo.findAwsUser({ email: me.email });
        campaignUser = await this.repositoryService.campaign.insertCampaignUser({
          userId: awsUser?.sub || v4(),
          email: me.email,
          name: me.display_name,
        });
        // todo: check if we need to store user attributes
      }
      await this.saveSpotifyTokens(
        campaignUser.userId,
        me.id,
        {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        },
        { accountType: me.product },
      );

      if (res.scope.includes('user-top-read')) {
        // fetch user top artists and tracks on background
        this.eventEmitter.emit(AppEventName.FETCH_USER_SPOTIFY_TOP_ARTISTS, {
          userId: campaignUser.userId,
          campaignId: body.campaignId,
        });
        this.eventEmitter.emit(AppEventName.FETCH_USER_SPOTIFY_TOP_TRACKS, {
          userId: campaignUser.userId,
          campaignId: body.campaignId,
        });
      }

      res['user'] = campaignUser;
    }

    return res;
  }

  async getPlaylist(link: string): Promise<GetPlaylistResponseDto> {
    const playlistLink = await this.getSpotifyPlaylistLink(link);

    const playlistId = this.spotifySdk.getPlaylistId(playlistLink);
    const response = await this.spotifySdk.getPlaylist(playlistId);
    const tracks = response.tracks.items
      .filter((el) => el.track)
      .map((item) => {
        return SpotifyParser.parseSpotifyTrack(item.track);
      });

    return {
      playlistKey: response.id,
      playlistName: response.name,
      playlistImage: response.images[0]?.url,
      skip: response.tracks.offset,
      take: response.tracks.limit,
      total: response.tracks.total,
      tracks: tracks as any,
    };
  }

  async createPlaylist(
    body: PostPlaylistBodyDto,
    sort: SpotifyPlaylistSort,
  ): Promise<PostPlaylistResponseDto> {
    if (!body.link && !body.playlist) {
      throw new Error(ErrorConst.LINK_OR_PLAYLIST_REQUIRED);
    }

    if (body.link && body.playlist) {
      throw new Error(ErrorConst.LINK_AND_PLAYLIST_CAN_NOT_BE_SPECIFIED_BOTH);
    }

    let image;
    let tracks;
    let playlist;

    if (body.link) {
      const link = await this.getSpotifyPlaylistLink(body.link);
      const playlistId = this.spotifySdk.getPlaylistId(link);
      playlist = await this.spotifySdk.getPlaylist(playlistId);
      tracks = playlist.tracks.items
        .map((el) => el.track)
        .filter((el) => el)
        .filter((el) => !el.is_local);
      image = playlist.images?.[0]?.url;
    } else {
      playlist = body.playlist;
      tracks = body.playlist.tracks;
      image = body.playlist.playlistImage;
    }

    if (tracks.length < MIN_PLAYLIST_SIZE && tracks.length > MAX_PLAYLIST_SIZE) {
      throw new Error(ErrorConst.BAD_PLAYLIST_LENGTH);
    }

    if (tracks.some((el) => el.is_local)) {
      throw new Error(ErrorConst.LOCAL_TRACKS_IS_PROHIBITED);
    }

    let key = PLAYLIST_DEFAULT_IMAGE_KEY;
    if (image) {
      const response = await axios.get(image, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'utf-8');

      const result = await this.s3Service.uploadFile(buffer, `temp/brackhits/${v4()}/thumbnail`, {
        ContentType: 'image/jpeg',
      });
      key = result.Key;
    }

    let dbTracks: SpotifyTrackModel[];
    if (body.link) {
      dbTracks = await this.playlistService.createPlaylist(tracks, sort);
    } else {
      dbTracks = await this.playlistService.savePlaylistTracks(tracks);
    }

    return {
      playlist: {
        playlistKey: playlist.id,
        name: playlist.name,
        image: {
          url: image,
          key,
        },
      },
      tracks: dbTracks.map((el) => SpotifyParser.parsePlaylistTrack(el)),
    };
  }

  // returns spotify user access data, updates access token if current is expired,
  // fetches spotifyUserId if current is not defined
  async getUserAccessData(userId: string): Promise<SpotifyUserAccessData | undefined> {
    const accessData: SpotifyUserAccessData = {};
    const spotifyToken = await this.repositoryService.userRepo.getUserSpotifyToken(userId);
    if (!spotifyToken) {
      return undefined;
    }

    // refresh access token if current is expired
    if (Date.now() > spotifyToken.expireTime) {
      const currentRefreshToken = spotifyToken.refreshToken.toString();
      const tokenBody = await this.spotifyClient.refreshAccessToken(currentRefreshToken);
      await this.repositoryService.userRepo.updateSpotifyTokens(
        userId,
        tokenBody.access_token,
        tokenBody.refresh_token || currentRefreshToken,
        Date.now() + tokenBody.expires_in * 1000,
      );
      accessData.accessToken = tokenBody.access_token;
    } else {
      accessData.accessToken = spotifyToken.accessToken.toString();
    }

    // fetch spotify user id if current is not defined
    if (!spotifyToken.spotifyUserId) {
      const spotifyUser = await this.spotifyClient.getMe(accessData.accessToken);
      await this.repositoryService.userRepo.updateUserTokenSpotifyId(userId, spotifyUser.id);
      accessData.spotifyUserId = spotifyUser.id;
    } else {
      accessData.spotifyUserId = spotifyToken.spotifyUserId;
    }

    return accessData;
  }

  // Returns user playlists from Spotify, applies query params options to them
  async getUserPlaylists(
    accessData: SpotifyUserAccessData,
    query: GetUserSpotifyPlaylistsQueryDto,
  ): Promise<PaginatedItems<SpotifyUserPlaylistsDto>> {
    if (query.preview) {
      return this.getUserPlaylistsPreview(accessData, query);
    } else {
      return this.getUserPlaylistsAll(accessData, query);
    }
  }

  // Returns top first Spotify user playlists allowed for brackhit creation
  async getUserPlaylistsPreview(
    accessData: SpotifyUserAccessData,
    query: GetUserSpotifyPlaylistsQueryDto,
  ): Promise<PaginatedItems<SpotifyUserPlaylistsDto>> {
    const playlists: SpotifyApi.PlaylistObjectSimplified[] = [];
    let body: SpotifyApi.ListOfUsersPlaylistsResponse;
    let skip = 0;
    const constant = await this.repositoryService.constantsRepo.getConstant(
      ConstantId.SPOTIFY_PLAYLISTS_PREVIEW_COUNT,
    );
    const params = SpotifyUtils.getPlaylistsValidationParams(accessData, query);

    // get user playlists until first :previewCount playlists are found or none are left
    do {
      body = await this.spotifyClient.getUserPlaylists(accessData.spotifyUserId, {
        accessToken: accessData.accessToken,
        offset: skip,
        limit: GET_USER_SPOTIFY_TRACKS_TAKE_DEFAULT,
      });
      const filtered = body.items.filter((el) => {
        const data = SpotifyUtils.isPlaylistAllowedForBrackhitCreation(el, params);
        return data.isAllowed;
      });
      playlists.push(...filtered);
      skip += GET_USER_SPOTIFY_TRACKS_TAKE_DEFAULT;
    } while (playlists.length < constant.value && body.next !== null);

    return {
      skip: 0,
      take: constant.value,
      items: playlists
        .slice(0, constant.value)
        .map((el) => SpotifyParser.parseUserPlaylist(el, params)),
    };
  }

  // Returns paginated array of all Spotify user playlists
  async getUserPlaylistsAll(
    accessData: SpotifyUserAccessData,
    query: GetUserSpotifyPlaylistsQueryDto,
  ): Promise<PaginatedItems<SpotifyUserPlaylistsDto>> {
    const params = SpotifyUtils.getPlaylistsValidationParams(accessData, query);

    const body = await this.spotifyClient.getUserPlaylists(accessData.spotifyUserId, {
      accessToken: accessData.accessToken,
      offset: query.skip,
      limit: query.take,
    });

    const playlists = body.items.map((el) => SpotifyParser.parseUserPlaylist(el, params));

    return {
      skip: body.offset,
      take: body.limit,
      total: body.total,
      items: playlists,
    };
  }

  private async getSpotifyPlaylistLink(link: string) {
    if (link.startsWith('https://spotify.link')) {
      const res = await axios.get(link);
      return res.data?.match(/https:\/\/open\.spotify\.com\/playlist\/[^\s"]+/g)?.[0];
    }

    return link;
  }

  private async saveSpotifyUser(data: { email: string; name: string }) {
    let user = await this.repositoryService.userRepo.findAwsUser({ email: data.email });
    if (!user) {
      user = await this.repositoryService.userRepo.saveAwsUser(
        v4(),
        generateUniqueUsername(),
        { email: data.email },
        { userImage: DEFAULT_USER_IMAGE },
      );
    }
    return user;
  }

  private async saveSpotifyTokens(
    userId: string,
    spotifyUserId: string,
    tokens: { accessToken: string; refreshToken: string },
    params: { accountType?: string },
  ) {
    await CampaignsSpotifyUserTokensModel.query()
      .insert({
        ...tokens,
        ...params,
        userId,
        spotifyUserId,
      })
      .onConflict('userId')
      .merge();
  }
}
