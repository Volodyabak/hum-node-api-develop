const express = require('express'),
  ArtistRoutes = require('../src/Routes/ArtistRoutes'),
  UserRoutes = require('../src/Routes/UserRoutes'),
  FeedRoutes = require('../src/Routes/FeedRoutes'),
  SpotifyRoutes = require('../src/Routes/SpotifyRoutes'),
  bodyParser = require('body-parser'),
  sinon = require('sinon'),
  Tools = require('../src/Tools');

const createApp = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(ArtistRoutes);
  app.use(UserRoutes);
  app.use(FeedRoutes);
  app.use(SpotifyRoutes);
  return app;
};

before((done) => {
  const getIdStub = sinon.stub(Tools, 'getUserIdFromToken');
  getIdStub.returns('1234');
  global.getIdStub = getIdStub;
  global.app = createApp();
  app.listen((err) => {
    if (err) {
      return done(err);
    }
    console.log('listening');
    done();
  });
});

beforeEach(() => {
  const pool = Tools.testMysqlPool();
  global.connection = pool;
  global.connectionMock = sinon.mock(pool);
});

afterEach(() => {
  connectionMock.restore();
});

after(() => {
  sinon.resetBehavior();
});
