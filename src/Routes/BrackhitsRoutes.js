const express = require('express');
const router = express.Router();

const {
  getBrackhitLeaderboard,
  createBrackhit,
  getTagsForHub,
  getBrackhitForShare,
  getBrackhitsHotTakes,
  putUserChoices,
  getBrackhitVotes,
  deleteBrackhit,
} = require('../Controllers/BrackhitsControllers');
const {
  addResponseMethod,
  setDefaultImages,
} = require('../Tools/Middlewars/AlbumImagesMiddleware');

router.post('/brackhits', addResponseMethod, createBrackhit, setDefaultImages);
router.get('/brackhits/hotTakes', addResponseMethod, getBrackhitsHotTakes, setDefaultImages); // good
router.get(
  '/brackhits/:brackhitId/share',
  addResponseMethod,
  getBrackhitForShare,
  setDefaultImages,
); // good
router.get('/brackhits/:brackhitId/leaderboard', getBrackhitLeaderboard); // good
router.put('/brackhits/:brackhitId/choices', putUserChoices);
router.get('/brackhits/hubs/:hubId/tags', getTagsForHub); // good
router.get('/brackhits/:brackhitId/votes', getBrackhitVotes); // good
router.delete('/brackhits/:brackhitId', deleteBrackhit);

module.exports = router;
