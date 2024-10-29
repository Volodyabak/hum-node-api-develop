import express from 'express';
const router = express.Router();
import { firstTimeTopArtists } from '../Controllers/SpotifyControllers';

router.get('/newUserTopArtists', firstTimeTopArtists);

export default router;
