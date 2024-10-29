const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  getMeData,
  getUserBrackhitPoints,
  getUserGamingData,
  getUserMusicProfile,
  getUserBadges,
  updateSpotifyToken,
  insertUser,
  getSpotifyTokens,
  getUserProfile,
  updateUserProfile,
  putGetMe,
  getFriendsRequests,
  getUserFriends,
  getUserByUsername,
  addTopArtistsToUserFeed,
  getUserTotalXP,
  createFtue,
  getLiveBrackhitCompletionXp,
} = require('../Controllers/UserControllers');
const {
  validate,
  userPutGetMeValidators,
} = require('../Tools/Validators');
const { validateUserProfile } = require('../Tools/Middlewars/UserMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/user/profile', validateUserProfile, getUserProfile); // good
router.put('/user/profile', updateUserProfile); // not in use
router.get('/user/currency', validateUserProfile, getUserTotalXP); // good
router.get('/user/points/:brackhitId', validateUserProfile, getUserBrackhitPoints); // good
router.get('/user/getMe', validateUserProfile, getMeData); // good
router.put('/user/getMe', upload.single('file'), validate(userPutGetMeValidators), putGetMe);
router.get('/user/userGamingData', getUserGamingData); // good
router.get('/user/musicProfile', getUserMusicProfile); // good
router.get('/user/badges', getUserBadges); // good
router.post('/user/spotify-tokens', updateSpotifyToken);
router.get('/user/spotify-tokens', getSpotifyTokens); // good
router.post('/link', insertUser);
router.get('/user/friend-requests', getFriendsRequests); // good
router.get('/user/:uid/friends', getUserFriends); // good
router.get('/user/username/:username', getUserByUsername); // good
router.post('/user/defaultFollow', addTopArtistsToUserFeed);
router.post('/user/ftue', createFtue);
router.get('/user/xp/live/:brackhitId', getLiveBrackhitCompletionXp);

module.exports = router;
