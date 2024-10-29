require('dotenv').config();
const Tools = require('../Tools');
const axios = require('axios');
const qs = require('qs');
const {
  UPDATE_USER_SPOTIFY_TOKEN,
  GET_USER_SPOTIFY_TOKENS,
  UPDATE_USER_SPOTIFY_ACCESS_TOKEN,
  GET_USER_PROFILE,
  UPDATE_USER_NAME,
  UPDATE_USER_FULLNAME,
  IS_USERNAME_DUPLICATE,
} = require('../Queries');
const { sendErrors } = require('../Errors/ErrorResonse');
const FriendsService = require('../Services/Friends/FriendsService');
const { UserService } = require('../Services/User/UserService');
const { BrackhitsServiceExpress } = require('../Services/Brackhits/BrackhitsServiceExpress');
const { NotFoundError, BadRequestError } = require('../Errors');
const { ArtistService } = require('../Services/Artist/ArtistService');
const { FeedService } = require('../Services/Feed/FeedService');
const { pool: connection } = require('../../database/MYSQL_database');
const { mapKeys, camelCase } = require('lodash');
const { TransactionsService } = require('../Services/Transactions/TransactionsService');
const { UserProfileInfoModel } = require('../../database/Models/User/UserProfileInfoModel');
const { S3Service } = require('../modules/aws/services/s3.service');
const { GET_USER_MUSIC_PROFILE_TAKE_DEFAULT } = require('../modules/users/constants');
const { getS3ImagePrefix } = require('../Tools/utils/image.utils');
const { AppEventName } = require('../modules/app-events/app-events.types');
const { emitExpressServerEvent } = require('../modules/app-events/constants');
const { Logger } = require('@nestjs/common');

const s3Service = new S3Service();
const logger = new Logger('UserControllers');

module.exports.getMeData = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);

  const [user, profile, topArtists, topTracks, userFriends, streaming, devices, userApp] =
    await Promise.all([
      UserService.getUser(userId),
      UserService.getSignedUserProfile(userId),
      UserService.getUserTopArtists(userId),
      UserService.getUserTopRecentTracks(userId),
      UserService.getUserFriends(userId),
      UserService.getUserAccountStreamingType(userId),
      UserService.getUserDevices(userId),
      UserService.getUserAppVersion(userId),
    ]);

  res.status(200).send({
    streaming,
    ...profile,
    version: userApp?.appVersion || null,
    joinDate: user.joinDate,
    deviceType: user.deviceType,
    notifications: devices.length > 0 ? 1 : 0,
    topArtists,
    topTracks,
    genres: Array.from(new Set(topArtists.map((item) => item.genreName))),
    friends: userFriends.length,
  });
};

module.exports.putGetMe = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  req.body = mapKeys(req.body, (v, k) => camelCase(k));

  const profile = await UserService.getUserProfile(userId);
  if (!profile) {
    throw new NotFoundError('Profile does not exists');
  }

  if (req.file) {
    const key = `profile/${userId}/avatar`;
    await s3Service.uploadFile(req.file.buffer, key, { ContentType: req.file.mimetype });
    req.body.userImage = getS3ImagePrefix() + key;
  }

  if (req.body.username) {
    req.body.username = req.body.username.toLowerCase();
    const profileWithUsername = await UserService.getUserProfileByUsername(req.body.username);
    if (profileWithUsername && profileWithUsername.userId !== userId) {
      throw new BadRequestError('username already exists');
    }
  }

  if (req.body.version) {
    await UserService.insertUserAppVersion(userId, req.body.version);
    delete req.body.version;
  }

  const updatedProfile = await UserService.updateProfile(userId, req.body);

  res.status(200).send(updatedProfile);
};

module.exports.getUserBrackhitPoints = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const brackhitId = req.params.brackhitId;

  const [profile, userScore] = await Promise.all([
    UserService.getSignedUserProfile(userId),
    BrackhitsServiceExpress.getUserBrackhitScore(userId, +brackhitId),
  ]);

  res.status(200).send({
    ...userScore,
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    userImage: profile.userImage,
  });
};

module.exports.getUserGamingData = async (request, response) => {
  const userId = Tools.getUserIdFromToken(request.headers.authorization);

  try {
    const gamingData = await UserService.getUserGamingData(userId);
    response.status(200).send(gamingData);
  } catch (err) {
    sendErrors(response, 500, err.message);
  }
};

module.exports.getUserMusicProfile = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const { take = GET_USER_MUSIC_PROFILE_TAKE_DEFAULT } = req.query;

  const [genres, mostListened, topRecentTracks] = await Promise.all([
    UserService.getUserGenres(userId),
    UserService.getUserMostListenedArtists(userId, +take),
    UserService.getUserTopRecentTracks(userId, +take),
  ]);

  const updatedGenres = genres.map((genre) => {
    const { p, ...rest } = genre;
    return {
      ...rest,
      percent: p * 100,
    };
  });

  res.status(200).send({
    genres: updatedGenres,
    mostListened,
    topRecentTracks,
  });
};

module.exports.getUserBadges = async (request, response) => {
  const userId = Tools.getUserIdFromToken(request.headers.authorization);

  try {
    const badges = await UserService.getUserBadges(userId);
    response.status(200).send(badges);
  } catch (err) {
    sendErrors(response, 500, err.message);
  }
};

module.exports.updateSpotifyToken = async (request, response) => {
  const userId = Tools.getUserIdFromToken(request.headers.authorization);
  const { access_token, refresh_token, account_type } = request.body;

  const user = await UserProfileInfoModel.query().findById(userId);
  if (!user) {
    throw new NotFoundError('User does not exist');
  }

  const params = {
    accessToken: access_token,
    refreshToken: refresh_token,
    accountType: account_type,
    userId: userId,
    hash: process.env.SPOTIFY_SECRET,
  };

  emitExpressServerEvent(AppEventName.CONNECT_SPOTIFY, { userId, accountType: account_type });

  connection.query(UPDATE_USER_SPOTIFY_TOKEN, params, (error, results) => {
    if (error) {
      console.log(`Update user Spotify token error: ${error}`);
      response.sendStatus(500);
    }
    response.json({
      success: true,
      message: 'User token data updated',
    });
  });
};

module.exports.fetchNewSpotifyToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    if (!process.env.SPOTIFY_CLIENT_ID) {
      reject(
        new Error(
          'The endpoint call failed because there is no SPOTIFY_CLIENT_ID variable in the .env file',
        ),
      );
    }
    if (!process.env.SPOTIFY_SECRET_KEY) {
      reject(
        new Error(
          'The endpoint call failed because there is no SPOTIFY_SECRET_KEY variable in the .env file',
        ),
      );
    }
    //setting up spotify request header parameters
    const dataToEncode = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_SECRET_KEY}`;
    const buffer = Buffer.from(dataToEncode);
    const base64EncodedData = buffer.toString('base64');

    //make the request for a new access token
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      headers: {
        Authorization: `Basic ${base64EncodedData}`,
      },
      json: true,
    })
      .then((response) => {
        if (!(response.data && response.data.access_token)) {
          reject(new Error('Bad spotify response received: missing `data.accessToken` field'));
        }

        resolve(response.data.access_token);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// TODO: Refactor
module.exports.getSpotifyTokens = (req, res) => {
  //endpoint error handling utility
  const formErrorObject = (error) => {
    return {
      error: {
        message: error.message,
        spotify_error_data: error.response && error.response.data,
      },
    };
  };
  const sendResponseError = (error) => {
    res.status(500).json(formErrorObject(error));
  };

  const headers = req.headers;
  const token = Tools.getUserIdFromToken(headers.authorization);
  const userId = token.toString();

  if (!process.env.SPOTIFY_SECRET) {
    return sendResponseError(
      new Error(
        'The endpoint call failed because there is no SPOTIFY_SECRET variable in the .env file',
      ),
    );
  }

  const updateSpotifyTokenPromise = (token) =>
    Tools.promisifiedQuery(
      UPDATE_USER_SPOTIFY_ACCESS_TOKEN,
      {
        hash: process.env.SPOTIFY_SECRET,
        accessToken: token,
        user_id: userId,
      },
      'Update user access Spotify token error: ',
    );

  connection.query(
    GET_USER_SPOTIFY_TOKENS,
    {
      id: userId,
      hash: process.env.SPOTIFY_SECRET,
    },
    (error, results) => {
      if (error) {
        sendResponseError(
          new Error(
            `Database query for getting user spotify tokens failed with error: ${error.message}`,
          ),
        );
      } else {
        if (results[0]) {
          let { refresh_token } = results[0];
          if (!refresh_token) {
            return sendResponseError(
              new Error(
                'The endpoint call failed because the database query has not returned any refresh token for this user ' +
                  '(the token decryption procedure has most likely failed - make sure that SPOTIFY_SECRET key in the .env file is correct)',
              ),
            );
          }

          refresh_token = refresh_token.toString();

          this.fetchNewSpotifyToken(refresh_token)
            .then((result) => {
              res.json({
                user_id: userId,
                spotify_access_token: result, // fresh access token
                spotify_refresh_token: refresh_token,
              });
              //update spotify_user_tokens table with the new token
              updateSpotifyTokenPromise(result).catch((error) => console.log(error));
            })
            .catch((error) => {
              sendResponseError(error);
            });
        } else res.json({ user_id: userId }); //if the query result is empty, the user is first-time user
      }
    },
  );
};

module.exports.getUserProfile = (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);

  connection.query(GET_USER_PROFILE, { userId }, (error, results) => {
    if (error) {
      console.log(`getUserProfile error: ${error}`);
      res.status(500).send();
    } else if (!results.length) {
      res.status(404).send('User not found');
    } else {
      const [result] = results;
      const { joinDate } = result;

      result.joinDate = new Date(
        Date.UTC(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate()),
      ); //trim the exact time, leaving only year-month-day data

      res.json(result);
    }
  });
};

module.exports.updateUserProfile = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);

  const { userName, userFullName } = req.body;
  const updatePromises = [];

  if (userName) {
    // check if the user name is unique
    try {
      const queryResult = await Tools.promisifiedQuery(IS_USERNAME_DUPLICATE, {
        userName,
      });
      const { nameDuplicate } = queryResult[0];

      if (nameDuplicate) {
        return res.status(400).send('User with such user name already exists');
      }
    } catch (error) {
      console.log(`Is username duplicate error: ${error}`);
      return res.status(500).send();
    }

    const updateUserNamePromise = Tools.promisifiedQuery(UPDATE_USER_NAME, {
      userName,
      userId,
    });
    updatePromises.push(updateUserNamePromise);
  }
  if (userFullName) {
    const updateUserFullNamePromise = Tools.promisifiedQuery(UPDATE_USER_FULLNAME, {
      userFullName,
      userId,
    });
    updatePromises.push(updateUserFullNamePromise);
  }

  Promise.all(updatePromises)
    .then((results) => {
      res.status(200).send();
    })
    .catch((error) => {
      console.log(`updateUserProfile error: ${error}`);
      res.status(500).send();
    });
};

module.exports.insertUser = async (request, response) => {
  const { body } = request;
  const params = {
    name: body.name || body.preferred_username,
    email: body.email,
    sub: body.sub,
  };

  // const emailParams = {
  //   'User ID': body.sub,
  //   'User email': body.email,
  //   'User name': body.name,
  // };

  try {
    if (!body.sub) {
      const message = 'Missing request body parameter: sub';
      // await SimpleEmailService.sendEndpointErrorEmail('/link', message, emailParams);
      throw new BadRequestError(message);
    }
    if (!body.email) {
      const message = 'Missing request body parameter: email';
      // await SimpleEmailService.sendEndpointErrorEmail('/link', message, emailParams);
      throw new BadRequestError(message);
    }

    const email = await UserService.getUserByEmail(body.email);

    if (email) {
      const message = 'User with such email already exists';
      // await SimpleEmailService.sendEndpointErrorEmail('/link', message, emailParams);
      throw new BadRequestError(message);
    }

    const user = await UserService.getUserProfile(params.sub);

    if (user) {
      const message = 'User with such profile already exists';
      // await SimpleEmailService.sendEndpointErrorEmail('/link', message, emailParams);
      throw new BadRequestError(message);
    }

    const { profile } = await UserService.insertNewUser(params);
    // await SimpleEmailService.sendEndpointCallEmail('/link', emailParams);

    await TransactionsService.insertUserSignedUpAward(params.sub);
    emitExpressServerEvent(AppEventName.CREATE_USER, { userId: body.sub });

    return response.send(profile);
  } catch (err) {
    logger.log(
      `[POST user/link - UserControllers::insertUser]: sub=${body.sub} | email=${body.email} | err=${err}`,
    );
    throw err;
  }
};

module.exports.getFriendsRequests = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);

  try {
    const incomingFriendRequests = await FriendsService.getIncomingFriendRequests(userId);
    const userProfiles = await Promise.all(
      incomingFriendRequests.map(async (friendRequest) =>
        UserService.getUserProfile(friendRequest.userId),
      ),
    );
    // await Promise.all(
    //   userProfiles.map(async (profile) => UserService.signProfileImageUrl(profile)),
    // );

    res.status(200).send(userProfiles);
  } catch (err) {
    sendErrors(res, 500, err.message);
  }
};

module.exports.getUserFriends = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const requestedUserId = req.params.uid;
  const { skip = 0, take = Number.MAX_SAFE_INTEGER } = req.query;
  const withCompatability = userId === requestedUserId;

  if ((skip !== undefined && skip < 0) || (take !== undefined && take < 0)) {
    throw new BadRequestError('skip and take query params must be integers and greater than 0');
  }

  const userFriends = await UserService.getUserFriends(
    requestedUserId,
    withCompatability,
    +skip,
    +take,
  );

  const result = await Promise.all(
    userFriends.map(async (el) => {
      const [profile, relationship] = await Promise.all([
        UserService.getSignedUserProfile(el.friendId),
        FriendsService.getUserFriendStatus(userId, el.friendId),
      ]);

      return {
        ...profile,
        relationship,
        compatability: el.compatability,
      };
    }),
  );

  res.status(200).send(result);
};

module.exports.getUserByUsername = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const user = await UserService.getUserProfileByUsername(req.params.username);

  if (!user) {
    throw new NotFoundError('User with this username was not found');
  }

  const [fullProfile, relationship] = await Promise.all([
    UserService.getFullUserProfile(user.userId),
    FriendsService.getUserFriendStatus(userId, user.userId),
  ]);

  res.status(200).send({
    ...fullProfile,
    relationship,
  });
  res.send(user);
};

module.exports.addTopArtistsToUserFeed = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);

  const artists = await ArtistService.getTopArtistsByDailyScore();
  await FeedService.setUserArtistFeedPreferencesArray(
    userId,
    artists.map((elem) => elem.id),
  );
  res.status(200).send();
};

module.exports.getUserTotalXP = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);

  const [xp, profile] = await Promise.all([
    UserService.getUserTotalXP(userId),
    UserService.getUserProfile(userId),
  ]);

  res.status(200).send({
    userId,
    username: profile.username,
    xp,
  });
};

module.exports.createFtue = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const { genreId, eraId } = req.body;

  const userFtue = await UserService.createFtue(userId, genreId, eraId);

  res.status(200).send(userFtue);
};

module.exports.getLiveBrackhitCompletionXp = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const { brackhitId } = req.params;
  const { date } = req.query;

  if (!date) {
    throw new BadRequestError('Missing date query param!');
  }

  const isLive = await BrackhitsServiceExpress.isLiveBrackhit(brackhitId, date);
  if (!isLive) {
    throw new BadRequestError(
      `Brackhit with brackhitId=${brackhitId} is not live for date=${date}`,
    );
  }

  const data = await TransactionsService.getUserBrackhitCompletionXp(brackhitId, userId);
  res.status(200).send(data);
};
