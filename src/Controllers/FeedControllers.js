const Tools = require('../Tools');
const { ArtistService } = require('../Services/Artist/ArtistService');
const { FeedService } = require('../Services/Feed/FeedService');

module.exports.setFeed = (req, res) => {
  const headers = req.headers;
  const userId = Tools.getUserIdFromToken(headers.authorization);
  const artistIds = req.body.artistIds;

  FeedService.setUserArtistFeedPreferencesArray(userId, artistIds)
    .then(() => res.status(200).send())
    .catch((err) => res.status(500).send(err.message));
};

module.exports.removeFeedArtist = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const { artistId } = req.body;

  await FeedService.removeUserFeedArtist(userId, artistId);
  res.sendStatus(200);
};
