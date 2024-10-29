/*
 ** Dont remove this, We use this to verify production API was updated properly
 ** UPDATE 352veu trigger 4/6
 */

import { AppLoggerMiddleware } from './midlleware/app-logger.middleware';

require('express-async-errors');

import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser'; // allows us to take POST data in node
import cors from 'cors';

import UserRoutes from './Routes/UserRoutes';
import ArtistRoutes from './Routes/ArtistRoutes';
import FeedRoutes from './Routes/FeedRoutes';
import SpotifyRoutes from './Routes/SpotifyRoutes';
import PickemRoutes from './Routes/PickemRoutes';
import BrackhitsRoutes from './Routes/BrackhitsRoutes';

import { ErrorHandlerMiddleware } from './Middleware/ErrorHandlerMiddleware';
import { Environment, whiteListedOrigins } from './constants';

const appLogger = new AppLoggerMiddleware();

const env = process.env.NODE_ENV || 'local';
const ignoreUrls = ['/health'];

const app = express();

// app.use(cors({ origin: env === Environment.PROD ? whiteListedOrigins : '*' }));
app.use(cors({ origin: '*' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
  ignoreUrls.includes(req.path) ? next() : appLogger.use(req, res, next);
});

app.use(UserRoutes); // USER
app.use(ArtistRoutes); //ARTISTS
app.use(FeedRoutes); //USER FEED
app.use(SpotifyRoutes); //SPOTIFY
app.use(PickemRoutes); //Pickem
app.use(BrackhitsRoutes);

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.use((err, req, res, next) => {
  ErrorHandlerMiddleware(err, req, res).catch(next);
});

export default app;
