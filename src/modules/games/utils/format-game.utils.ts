import { BrackhitContentType } from '../../brackhits/constants/brackhits.constants';
import {
  ArtistModel,
  CampaignCustomContentNameModel,
  SpotifyAlbumModel,
  YoutubeVideoModel,
} from '@database/Models';
import { TrackInfoDto } from '../../tracks/tracks.dto';
import { YoutubeClipModel } from '@database/Models/Artist/YoutubeClipModel';
import { TiktokModel } from '@database/Models/tiktok.model';
import { CustomContentModel } from '@database/Models/campaign/custom-content.model';
import { Choice, Trivia } from '@database/mongodb';
import { VimeoVideoInfoDto } from '../../brackhits/dto/brackhits.dto';

type ContentType =
  | TrackInfoDto
  | SpotifyAlbumModel
  | ArtistModel
  | YoutubeVideoModel
  | VimeoVideoInfoDto
  | TiktokModel
  | CustomContentModel
  | YoutubeClipModel;

class ChoiceResponse extends Choice {
  content?: ContentType;
}

export function formatTriviaResponse(trivia: Trivia) {
  trivia.rounds.forEach((round) => {
    round.question.choices = round.question.choices.map((choice) => {
      const nChoice = formatChoiceResponse(choice.type, choice);
      return nChoice;
    }) as any;
  });
}

export function formatChoiceResponse(
  type: BrackhitContentType,
  choice: { choiceId: number; content?: ContentType },
  contentDetails?: CampaignCustomContentNameModel,
) {
  if (!choice.content) {
    return null;
  }

  const details = formatDetailsResponse(contentDetails);

  if (type === BrackhitContentType.Track) {
    const track = choice.content as TrackInfoDto;

    return {
      choiceId: choice.choiceId,
      contentId: track.id,
      trackKey: track.trackKey,
      trackName: track.trackName,
      artists: track.artists,
      albumName: track.albumName,
      albumImage: track.albumImage,
      preview: track.preview,
      details: details,
    };
  } else if (type === BrackhitContentType.Album) {
    const album = choice.content as SpotifyAlbumModel;

    return {
      choiceId: choice.choiceId,
      contentId: album.id,
      albumKey: album.albumKey,
      albumName: album.name,
      albumImage: album.albumImage,
      artists: album.spotifyArtists.map((spotifyArtist) => spotifyArtist.artistName).join(', '),
      details: details,
    };
  } else if (type === BrackhitContentType.Artist) {
    const artist = choice.content as ArtistModel;

    return {
      choiceId: choice.choiceId,
      contentId: artist.id,
      artistKey: artist.artistKey,
      artistName: artist.facebookName,
      artistImage: artist.imageFile,
      genre: artist.genre?.genreName,
      details: details,
    };
  } else if (type === BrackhitContentType.Youtube) {
    const video = choice.content as YoutubeVideoModel;

    return {
      choiceId: choice.choiceId,
      contentId: video.id,
      videoKey: video.youtubeKey,
      videoName: video.videoTitle,
      videoImage: video.thumbnail,
      details: details,
    };
  } else if (type === BrackhitContentType.YoutubeClip) {
    const clip = choice.content as YoutubeClipModel;

    return {
      choiceId: choice.choiceId,
      contentId: clip.id,
      clipId: clip.youtubeClipId,
      video: {
        videoKey: clip.video.youtubeKey,
        videoName: clip.video.videoTitle,
        videoImage: clip.video.thumbnail,
      },
      details: details,
    };
  } else if (type === BrackhitContentType.TikTok) {
    const tiktok = choice.content as TiktokModel;

    return {
      choiceId: choice.choiceId,
      contentId: tiktok.id,
      title: tiktok.title,
      author: tiktok.author,
      thumbnail: tiktok.thumbnail,
      link: tiktok.link,
      videoCreated: tiktok.videoCreated,
      details: details,
    };
  } else if (type === BrackhitContentType.Custom) {
    const custom = choice.content as CustomContentModel;

    return {
      choiceId: choice.choiceId,
      contentId: custom.id,
      name: custom.name,
      thumbnail: custom.thumbnail,
      contentUrl: custom.contentUrl,
      sourceTypeId: custom.sourceTypeId,
    };
  }

  return null;
}

export function formatDetailsResponse(contentDetails?: CampaignCustomContentNameModel) {
  return {
    primaryName: contentDetails?.primaryName,
    secondaryName: contentDetails?.secondaryName,
    text: contentDetails?.detail,
    mediaType: contentDetails?.mediaType,
    media: contentDetails?.additionalMedia,
  };
}
