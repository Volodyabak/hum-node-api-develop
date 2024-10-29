const { BrackhitsServiceExpress } = require('../Services/Brackhits/BrackhitsServiceExpress');
const { BrackhitHubsService } = require('../Services/Brackhits/BrackhitHubsService');
const { BrackhitUtils } = require('../Services/Brackhits/BrackhitUtils');
const { UserService } = require('../Services/User/UserService');
const { BadRequestError, NotFoundError } = require('../Errors');
const Tools = require('../Tools');
const { v4: uuidv4 } = require('uuid');
const { S3Service } = require('../modules/aws/services/s3.service');
const { BRACKHIT_SORTING_ID } = require('../../database/Models/BrackhitModel');
const axios = require('axios');
const { getS3ImagePrefix } = require('../Tools/utils/image.utils');
const { SpotifyTrackModel } = require('../../database/Models');
const { Relations } = require('../../database/relations/relations');
const { expr } = require('../../database/relations/relation-builder');
const { emitExpressServerEvent } = require('../modules/app-events/constants');
const { AppEventName } = require('../modules/app-events/app-events.types');

const brackhitUtils = new BrackhitUtils();
const s3Service = new S3Service();

module.exports.putUserChoices = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const { brackhitId } = req.params;

  const brackhit = await BrackhitsServiceExpress.getBrackhit(brackhitId);
  if (!brackhit) {
    throw new NotFoundError('Brackhit does not exists');
  }

  let userBrackhit = await BrackhitsServiceExpress.getUserBrackhit(userId, brackhitId);
  if (!userBrackhit) {
    userBrackhit = await BrackhitsServiceExpress.createUserBrackhit(userId, brackhitId);
  }
  if (userBrackhit.isComplete) {
    throw new BadRequestError('User already submit his choices');
  }

  const choices = req.body.map((el) => {
    return {
      ...el,
      userId,
      brackhitId,
    };
  });
  const result = await Promise.all(
    choices.map((el) => BrackhitsServiceExpress.updateBrackhitChoice(el)),
  );

  res.status(200).send(result);
};

module.exports.getBrackhitLeaderboard = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const brackhitId = req.params.brackhitId;
  const { skip = '0', take = '20' } = req.query;

  const userBrackhit = await BrackhitsServiceExpress.getUserBrackhit(userId, brackhitId);

  if (userBrackhit?.isComplete !== 1) {
    throw new BadRequestError(
      `User with userId=${userId} hasn't completed brackhit with id=${brackhitId}`,
    );
  }

  const [leaderboard, userFriends] = await Promise.all([
    BrackhitsServiceExpress.getBrackhitLeaderboardData(brackhitId, userId, +skip, +take),
    UserService.getUserFriends(userId),
  ]);

  leaderboard.forEach(
    (u) =>
      (u.isFriends =
        u.userId === userId || !!userFriends.find((friend) => friend.friendId === u.userId)),
  );

  res.status(200).send(leaderboard);
};

module.exports.createBrackhit = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const {
    name,
    playlistKey,
    description,
    duration,
    tracks,
    thumbnail,
    displaySeeds = 0,
    size = 16,
    sortingId = BRACKHIT_SORTING_ID.DEFAULT,
  } = req.body;
  const type = brackhitUtils.brackhitTypeId.THEME;
  let timeLive = req.body;

  const errors = await BrackhitsServiceExpress.validateBrackhit({
    name,
    duration,
    timeLive,
    tracks,
    displaySeeds,
    sortingId,
  });

  if (errors.length) {
    throw new BadRequestError(errors.join('; '));
  }

  if (timeLive) {
    timeLive = new Date();
  }

  let brackhitImage;
  if (thumbnail?.startsWith('temp/')) {
    const newKey = thumbnail.replace('temp/', '');
    await s3Service.copyFile(thumbnail, newKey);
    await s3Service.deleteObjects({ Objects: [{ Key: thumbnail }] });
    brackhitImage = getS3ImagePrefix() + newKey;
  } else {
    const dbTracks = await SpotifyTrackModel.query()
      .withGraphFetched(expr([Relations.Album]))
      .whereIn(
        'id',
        tracks.map((el) => el.id),
      );
    const trackImages = dbTracks.map((el) => el.album?.albumImage);

    const response = await axios.get(trackImages[0], { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'utf-8');
    const { Key } = await s3Service.uploadFile(buffer, `brackhits/${uuidv4()}/thumbnail`, {
      ContentType: 'image/jpeg',
    });
    brackhitImage = getS3ImagePrefix() + Key;
  }

  const brackhit = await BrackhitsServiceExpress.createBrackhit({
    type,
    tracks,
    name,
    ownerId: userId,
    playlistKey,
    description,
    timeLive,
    duration,
    displaySeeds,
    sortingId,
    thumbnail: brackhitImage,
    size,
  });

  const [choices] = await Promise.all([
    BrackhitsServiceExpress.getBrackhitChoices(brackhit.brackhitId),
    // TransactionsService.deductBrackhitCreatedPrice(brackhit.brackhitId, userId),
  ]);

  emitExpressServerEvent(AppEventName.CREATE_BRACKHIT, {
    userId,
    brackhitId: brackhit.brackhitId,
    brackhitName: brackhit.name,
  });

  res.status(200).response({
    ...brackhit,
    choices,
    isComplete: 0,
    userStatus: brackhitUtils.userStatus.NONE,
  });
};

module.exports.getTagsForHub = async (req, res) => {
  const { hubId } = req.params;

  const data = await BrackhitHubsService.getTagsForHubData(+hubId);
  res.status(200).send(data);
};

module.exports.getBrackhitForShare = async (req, res) => {
  const { brackhitId } = req.params;

  const brackhit = await BrackhitsServiceExpress.getBrackhitWithOwner(brackhitId);
  res.status(200).send(brackhit);
};

module.exports.getBrackhitsHotTakes = async (req, res) => {
  const { take } = req.query;

  const data = await BrackhitsServiceExpress.getBrackhitsHotTakes(+take || Number.MAX_SAFE_INTEGER);

  res.status(200).response(data);
};

module.exports.getBrackhitVotes = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const { brackhitId } = req.params;
  const { roundId } = req.query;

  if (roundId !== undefined && (!Number.isInteger(+roundId) || +roundId < 1 || +roundId > 15)) {
    throw new BadRequestError(
      'roundId query param must be an integer between 1 and 15 inclusively!',
    );
  }

  const brackhit = await BrackhitsServiceExpress.getBrackhit(brackhitId);
  if (!brackhit) {
    throw new BadRequestError(`Brackhit with brackhitId=${brackhitId} does not exist!`);
  }

  const completions = await BrackhitsServiceExpress.getBrackhitCompletions(brackhitId);
  const minCompletions = brackhitUtils.minBrackhitCompletions;

  if (completions < minCompletions) {
    throw new BadRequestError(
      `Votes are not available for brackhits with less than ${minCompletions} completions!`,
    );
  }

  const votes = await BrackhitsServiceExpress.getBrackhitVotes(brackhitId, +roundId);

  res.status(200).send({
    brackhitId: +brackhitId,
    name: brackhit.name,
    votes,
  });
};

module.exports.deleteBrackhit = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const { brackhitId } = req.params;
  const brackhit = await BrackhitsServiceExpress.getBrackhit(brackhitId);

  if (!brackhit) {
    throw new NotFoundError('Brackhit does not exists');
  }
  if (brackhit.ownerId !== userId) {
    throw new BadRequestError('User is not the owner of the brackhit');
  }

  try {
    const key = brackhit.thumbnail.replace(getS3ImagePrefix(), '');
    await s3Service.deleteObjects({ Objects: [{ Key: key }] });
  } catch (err) {
    console.error('Delete brackhit image error:', err);
  }

  await BrackhitsServiceExpress.deleteBrackhit(brackhitId);
  res.sendStatus(200);
};
