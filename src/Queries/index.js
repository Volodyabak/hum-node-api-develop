const ArtistQueries = require('./ArtistQueries');
const SpotifyQueries = require('./SpotifyQueries');
const UserQueries = require('./UserQueries');
const FeedQueries = require('./FeedQueries');
const PickemQueries = require('./PickemQueries');
const FriendsQueries = require('./FriendsQueries');
const TrackQueries = require('./TrackQueries');
const BrackhitsQueries = require('./Brackhits/BrackhitsQueries');
const BrackhitsHubQueries = require('./Brackhits/BrackhitsHubQueries');

module.exports = {
  ...ArtistQueries,
  ...SpotifyQueries,
  ...UserQueries,
  ...FeedQueries,
  ...PickemQueries,
  ...FriendsQueries,
  ...TrackQueries,
  ...BrackhitsQueries,
  ...BrackhitsHubQueries,
};
