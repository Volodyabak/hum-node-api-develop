import { TrackInfoDto } from '../../tracks/tracks.dto';
import { BrackhitContentType } from '../../brackhits/constants/brackhits.constants';
import {
  ArtistModel,
  BallotMatchupsModel,
  BallotModel,
  CampaignCustomContentNameModel,
  CampaignModel,
  SpotifyAlbumModel,
  YoutubeVideoModel,
} from '@database/Models';
import { CustomContentModel } from '@database/Models/campaign/custom-content.model';
import { TiktokModel } from '@database/Models/tiktok.model';
import { YoutubeClipModel } from '@database/Models/Artist/YoutubeClipModel';

export function formatGetBallotResponse(ballot: BallotModel, campaign?: CampaignModel) {
  return {
    id: ballot.id,
    votingTypeId: ballot.votingTypeId,
    name: ballot.ballotName,
    description: ballot.detail,
    ownerId: ballot.ownerId,
    thumbnail: ballot.thumbnail,
    categoriesCount: ballot.categoryCount,
    displayCustomNames: !!campaign?.useCustomNames,
    categories: ballot.categories.map((category) => ({
      type: category.contentType.type,
      roundId: category.roundId,
      categoryId: category.categoryId,
      categorySize: category.categorySize,
      categoryName: category.categoryName.categoryName,
      detail: category.categoryName.detail,
      numberOfVotes: category.numberOfVotes,
      votingTypeId: category.votingTypeId,
      choices: category.choices.map((choice) =>
        formatContentResponse(category.contentType.type, choice, choice.contentDetails),
      ),
    })),
    createdAt: ballot.createdAt,
    updatedAt: ballot.updatedAt,
  };
}

export function formatContentResponse(
  type: BrackhitContentType,
  choice: Partial<BallotMatchupsModel>,
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

export function formatTrackResponse(choice: TrackInfoDto) {
  return {
    contentId: choice.id,
    trackKey: choice.trackKey,
    trackName: choice.trackName,
  };
}
