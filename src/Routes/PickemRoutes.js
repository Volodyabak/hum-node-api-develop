const express = require('express');
const router = express.Router();
const {
  startPickemGame,
  answerPickemRound,
  getInProgressPickem,
} = require('../Controllers/PickemControllers');

router.post('/pickem', startPickemGame); // do not remove!
router.post('/pickem/:gameId', answerPickemRound);
router.get('/pickem', getInProgressPickem);

module.exports = router;
