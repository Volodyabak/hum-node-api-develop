const express = require('express');
const router = express.Router();
const {
  getArtistYoutube,
  getArtistRead,
} = require('../Controllers/ArtistControllers');

router.get('/youtube/:artistId', getArtistYoutube); // good
router.get('/artistRead/:artistId', getArtistRead); // good

module.exports = router;
