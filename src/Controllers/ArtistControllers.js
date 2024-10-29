const { ArtistService } = require('../Services/Artist/ArtistService');

module.exports.getArtistYoutube = (request, response) => {
  const { artistId } = request.params;
  const take = +request.query.take || 10;
  const skip = +request.query.skip || 0;
  Promise.all([ArtistService.getArtistChannel(artistId), ArtistService.getArtistsVideos(artistId, +take, skip)])
    .then((values) => {
      const responseVals = {};
      responseVals.channel = values[0];
      responseVals.videos = values[1];
      response.set('Content-Type', 'application/json');
      response.send(responseVals);
    })
    .catch((err) => {
      console.log(`Get artist youtube error: ${err}`);
      return response.sendStatus(500);
    });
};

module.exports.getArtistRead = (request, response) => {
  const { artistId } = request.params;
  Promise.all([ArtistService.getArtistTweets(artistId), ArtistService.getArtistNews(artistId)])
    .then((values) => {
      const newTweets = values[0].map((tweet) => {
        const newTweet = tweet;
        if (newTweet.tweetMedia) {
          newTweet.tweetMedia = JSON.parse(newTweet.tweetMedia);
        }
        if (newTweet.replyData) {
          newTweet.replyData = JSON.parse(newTweet.replyData);
        }
        return newTweet;
      });
      const responseVals = [...newTweets, ...values[1]].sort((a, b) => {
        const first = Date.parse(a.timeStamp);
        const second = Date.parse(b.timeStamp);
        return second - first;
      });
      response.set('Content-Type', 'application/json');
      response.send(responseVals);
    })
    .catch((err) => {
      console.log(`Get artist read error: ${err}`);
      return response.sendStatus(500);
    });
};
