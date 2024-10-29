const express = require('express');
const router = express.Router();

const {
  setFeed,
  removeFeedArtist,
} = require('../Controllers/FeedControllers');

router.post('/feed/', setFeed);
router.delete('/feed/', removeFeedArtist);

module.exports = router;
