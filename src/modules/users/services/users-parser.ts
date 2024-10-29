import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import {
  UserArtistDto,
  UserBrackhitDto,
  UserCreatedBrackhitDto,
  UserCreatedBrackhitPreviewDto,
} from '../dto/users.dto';
import { ArtistModel, UserProfileInfoModel } from '../../../../database/Models';
import { SearchedUserDto } from '../../friends/dto/friends.dto';
import { UsersUtils } from '../utils/users.utils';
import { UserBrackhitChoiceMeta, UserTopChoiceMeta } from '../interfaces/users.interface';

export class UsersParser {
  static parseUserBrackhits(brackhits: BrackhitModel[]): UserBrackhitDto[] {
    return brackhits.map((b) => ({
      brackhitId: b.brackhitId,
      brackhitName: b.name,
      brackhitImage: b.thumbnail,
      isComplete: !!b.isComplete,
    }));
  }

  static parseUserCreatedBrackhits(brackhits: BrackhitModel[]): UserCreatedBrackhitDto[] {
    return brackhits.map((b) => ({
      brackhitId: b.brackhitId,
      brackhitName: b.name,
      brackhitImage: b.thumbnail,
      isComplete: !!b.isComplete,
      completions: +b.completions,
    }));
  }

  static parseUserCreatedBrackhitsPreview(
    brackhits: BrackhitModel[],
  ): UserCreatedBrackhitPreviewDto[] {
    return brackhits.map((b) => ({
      brackhitId: b.brackhitId,
      name: b.name,
      thumbnail: b.thumbnail,
    }));
  }

  static parseUserArtists(artists: ArtistModel[]): UserArtistDto[] {
    return artists.map((a) => ({
      artistId: a.id,
      artistName: a.facebookName,
      artistPhoto: a.imageFile,
      genreName: a.genreName || '',
      isFollowing: a.tokenUserArtistId ? 1 : 0,
    }));
  }

  static parseSearchedUsers(users: UserProfileInfoModel[]): SearchedUserDto[] {
    return users.map((u) => ({
      userId: u.userId,
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      userImage: u.userImage,
      influencerType: u.influencerType,
      userBio: u.userBio,
      userHometown: u.userHometown,
      relationship: UsersUtils.identifyUserRelationshipForSearchUsers(u.relationshipOrder),
    }));
  }

  static parseUserBrackhitChoices(choices: UserBrackhitChoiceMeta[]) {
    return choices.map((el) => ({
      userId: el.userId,
      brackhitId: el.brackhitId,
      roundId: el.roundId,
      choiceId: el.choiceId,
      contentId: el.contentId,
      type: el.type,
      content: {
        id: el.contentId,
        trackKey: el.trackKey,
        trackName: el.trackName,
        artists: el.artists,
        preview: el.preview,
        albumImage: el.albumImage,
      },
    }));
  }

  static parseUserTopChoices(choice: UserTopChoiceMeta) {
    return {
      choiceId: choice.choiceId,
      brackhit: {
        brackhitId: choice.brackhitId,
        name: choice.name,
        thumbnail: choice.thumbnail,
        type: choice.type,
      },
      content: {
        id: choice.contentId,
        trackKey: choice.trackKey,
        trackName: choice.trackName,
        artists: choice.artists,
        preview: choice.preview,
        albumImage: choice.albumImage,
      },
    };
  }
}
