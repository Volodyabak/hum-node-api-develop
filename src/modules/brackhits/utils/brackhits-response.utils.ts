import { BrackhitMasterResponseDto } from '../dto/brackhits-master.dto';
import { BrackhitMatchupsModel } from '@database/Models/BrackhitMatchupsModel';
import { BrackhitResultsModel } from '@database/Models/BrackhitResultsModel';
import { BrackhitRepliesModel } from '@database/Models';
import { BrackhitModel } from '@database/Models/BrackhitModel';
import { ReplyBrackhitCommentResponseDto } from '../dto/brackhits-comments.dto';
import {
  GetBrackhitResponseDto,
  GetBrackhitResultsResponseDto,
} from '../api-dto/brackhits-api.dto';
import { BrackhitChoiceDto, BrackhitResultDto } from '../dto/brackhits.dto';

export function formatGetBrackhitResultsResponse(
  meta: BrackhitModel,
  results: BrackhitResultDto[],
): GetBrackhitResultsResponseDto {
  return {
    brackhitId: meta.brackhitId,
    name: meta.name,
    description: meta.description,
    ownerId: meta.ownerId,
    timeLive: meta.timeLive,
    duration: meta.duration,
    size: meta.size,
    thumbnail: meta.thumbnail,
    url: meta.url,
    type: meta.type,
    scoringState: meta.scoringState,
    displaySeeds: meta.displaySeeds,
    isLive: meta.isLive,
    userStatus: meta.userStatus,
    results,
  };
}

export function formatGetBrackhitResponse(
  meta: BrackhitModel,
  choices: BrackhitChoiceDto[],
): GetBrackhitResponseDto {
  return {
    brackhitId: meta.brackhitId,
    name: meta.name,
    description: meta.description,
    ownerId: meta.ownerId,
    owner: meta.owner.username,
    ownerImage: meta.owner.userImage,
    influencerType: meta.owner.influencerType,
    timeLive: meta.timeLive,
    duration: meta.duration,
    size: meta.size,
    thumbnail: meta.thumbnail,
    url: meta.url,
    type: meta.type,
    scoringState: meta.scoringState,
    displaySeeds: meta.displaySeeds,
    thirdPlace: meta.thirdPlace,
    startingRound: meta.startingRound,
    isComplete: meta.isCompleted,
    centralId: meta.centralId,
    isLive: meta.isLive,
    userStatus: meta.userStatus,
    choices: choices,
  };
}

export function formatBrackhitMasterResponse(
  initial: BrackhitMatchupsModel[],
  winners: (BrackhitResultsModel & { percent: number; seed: number })[],
): BrackhitMasterResponseDto {
  const initialMap = new Map(
    initial.map((el) => [
      `${el.roundId}:${el.choiceId}`,
      {
        brackhitId: el.brackhitId,
        roundId: el.roundId,
        choiceId: el.choiceId,
        seed: el.seed,
        contentTypeId: el.brackhitContent.contentTypeId,
        type: el.brackhitContent.contentType.contentType,
        contentId: el.brackhitContent.contentId,
        content: {
          id: el.brackhitContent.track.id,
          trackName: el.brackhitContent.track.trackName,
          artists: el.brackhitContent.track.artists.map((el) => el.artistName).join(', '),
          trackKey: el.brackhitContent.track.trackKey,
          albumImage: el.brackhitContent.track.album.albumImage,
          preview: el.brackhitContent.track.trackPreview,
        },
      },
    ]),
  );

  return {
    initial: initial.map((el) => ({
      brackhitId: el.brackhitId,
      roundId: el.roundId,
      choiceId: el.choiceId,
      seed: el.seed,
      contentTypeId: el.brackhitContent.contentTypeId,
      type: el.brackhitContent.contentType.contentType,
      contentId: el.brackhitContent.contentId,
      content: {
        id: el.brackhitContent.track.id,
        trackName: el.brackhitContent.track.trackName,
        artists: el.brackhitContent.track.artists.map((el) => el.artistName).join(', '),
        trackKey: el.brackhitContent.track.trackKey,
        albumImage: el.brackhitContent.track.album.albumImage,
        preview: el.brackhitContent.track.trackPreview,
      },
    })),
    winners: winners.map((el) => {
      return {
        brackhitId: el.brackhitId,
        roundId: el.roundId,
        choiceId: el.choiceId,
        seed: el.seed,
        contentTypeId: el.choice.contentTypeId,
        type: el.choice.contentType.contentType,
        contentId: el.choice.contentId,
        content: {
          id: el.choice.track.id,
          trackName: el.choice.track.trackName,
          artists: el.choice.track.artists.map((el) => el.artistName).join(', '),
          trackKey: el.choice.track.trackKey,
          albumImage: el.choice.track.album.albumImage,
          preview: el.choice.track.trackPreview,
        },
        ...initialMap.get(`${el.roundId}:${el.choiceId}`),
        winner: el.winner,
        votes: el.votes,
        percent: el.percent,
      };
    }),
  };
}

export function formatBrackhitReplyResponse(
  reply: BrackhitRepliesModel,
): ReplyBrackhitCommentResponseDto {
  return {
    replyId: reply.replyId,
    commentUserId: reply.comment?.userId,
    brackhitId: reply.comment?.brackhitId,
    replyUserName: reply.userProfile?.username,
  };
}
