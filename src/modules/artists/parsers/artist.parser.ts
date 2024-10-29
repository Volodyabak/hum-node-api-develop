import { ArtistModel, SpotifyAlbumModel, SpotifyTrackModel } from '../../../../database/Models';
import {
  ArtistDefaultDto,
  ArtistDto,
  ArtistProfileDto,
  ArtistReleaseBlurbDto,
  ArtistTrackDto,
  SearchedArtistDto,
} from '../dto/artists.dto';

export class ArtistParser {
  static parseArtist(a: ArtistModel): ArtistDto {
    return {
      artistId: a.id,
      artistName: a.facebookName,
      artistPhoto: a.imageFile,
      spotifyId: a.artistKey,
      rankChange: a.direction,
      buzzPoints: a.dailyPoints,
      genreName: a.genreName || '',
      category: a.category || '',
      newBlurbs: 0,
      isFollowed: a.tokenUserArtistId ? 1 : 0,
    };
  }

  static parseArtists(artists: ArtistModel[]): ArtistDto[] {
    return artists.map((a) => ({
      artistId: a.id,
      artistName: a.facebookName,
      artistPhoto: a.imageFile,
      spotifyId: a.artistKey,
      rankChange: a.direction,
      buzzPoints: a.dailyPoints,
      genreName: a.genreName || '',
      category: a.category || '',
      newBlurbs: 0,
      isFollowed: !!a.tokenUserArtistId,
    }));
  }

  static parseSearchedArtists(artists: ArtistModel[]): SearchedArtistDto[] {
    return artists.map((a) => ({
      id: a.id,
      name: a.facebookName,
      photo: a.imageFile,
      buzzPoints: a.dailyPoints,
      isFollowed: !!a.tokenUserArtistId,
    }));
  }

  static parseArtistProfiles(artists: ArtistModel[]): ArtistProfileDto[] {
    return artists.map((a) => ({
      id: a.id,
      name: a.facebookName,
      photo: a.imageFile,
      spotifyId: a.artistKey,
      buzzPoints: a.dailyPoints,
      rankChange: a.direction,
      genreName: a.genreName || '',
      category: a.category || '',
      isFollowed: !!a.tokenUserArtistId,
    }));
  }

  static parseArtistReleaseBlurbs(
    releases: SpotifyAlbumModel[],
    total: number,
  ): ArtistReleaseBlurbDto[] {
    return releases.map((el) => ({
      contentId: el.albumKey,
      timeStamp: el.releaseDate,
      image: el.albumImage,
      blurb: el.name,
      contentType: 5,
      total: total,
    }));
  }

  static parseArtistTracks(tracks: SpotifyTrackModel[]): ArtistTrackDto[] {
    return tracks.map((el) => ({
      trackKey: el.trackKey,
      trackName: el.trackName,
      preview: el.trackPreview || el.appleTrackPreview,
      albumImage: el.albumImage,
    }));
  }

  static parseDefaultArtist(el: ArtistModel): ArtistDefaultDto {
    return {
      id: el.id,
      name: el.facebookName,
      image: el.imageFile,
      followCount: el.followCount,
    };
  }
}
