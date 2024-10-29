const mysql = require('mysql');
const { DuplicateError } = require('./Errors/DuplicateError');
const {
  animals,
  uniqueNamesGenerator,
  colors,
  adjectives,
  NumberDictionary,
} = require('unique-names-generator');
const { pool: connection } = require('../database/MYSQL_database');

module.exports.getUserIdFromToken = (token) => {
  if (token === undefined) {
    throw new Error('User authorization token is not defined!');
  }
  const payload = token.split('.')[1];
  const userFromToken = Buffer.from(payload, 'base64');
  const userJson = userFromToken.toString('ascii');
  const userId = JSON.parse(userJson);
  return userId.sub;
};

// promisified version of connection.query (basically a promise wrappper)
// NOTE: do not call this function if you want to defer the query execution. Use () => promisifiedQuery(...) lambda instead o
module.exports.promisifiedQuery = (query, params = {}, customErrorMessage = '') => {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        const errorMessage = customErrorMessage ? customErrorMessage + error.message : error.message;
        if (error.code === 'ER_DUP_ENTRY') {
          reject(new DuplicateError(errorMessage));
        }
        // append custom error message to the main error, if one is supplied
        const rejectError = customErrorMessage ? new Error(customErrorMessage + error.message) : error;
        reject(rejectError);
      }

      resolve(results);
    });
  });
};

module.exports.testMysqlPool = () => {
  return mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    queryFormat: (query, values) => {
      if (!values) return query;
      return query.replace(
        /:(\w+)/g,
        function (txt, key) {
          if (values.hasOwnProperty(key)) {
            return pool.escape(values[key]);
          }
          return txt;
        }.bind(this)
      );
    },
  });
};

module.exports.chooseRoundWinner = (votes) => {
  if (votes[0] > votes[1]) {
    return [1, 0];
  } else if (votes[0] < votes[1]) {
    return [0, 1];
  } else {
    if (Math.random() >= 0.5) {
      return [0, 1];
    } else {
      return [1, 0];
    }
  }
};

module.exports.getRoundPoints = (roundId, winner, x = 9) => {
  if (!winner) return 0;

  let roundGroup;
  if (roundId >= 1 && roundId <= 8) {
    roundGroup = 1;
  } else if (roundId >= 9 && roundId <= 12) {
    roundGroup = 2;
  } else if (roundId === 13 || roundId === 14) {
    roundGroup = 3;
  } else if (roundId === 15) {
    roundGroup = 4;
  } else {
    throw new Error(
      `Tools.getRoundPoints roundId argument must be equal or greater than 0 and equal or less than 15, roundId=${roundId}`
    );
  }

  return x * Math.pow(2, roundGroup - 1);
};

module.exports.getPaginatedArray = (array, skip, take) => {
  return array.slice(skip, skip + take >= array.length ? array.length : skip + take);
};

module.exports.generateUniqueUsername = () => {
  const numbers = NumberDictionary.generate({ min: 1, max: 999 });
  return uniqueNamesGenerator({
    dictionaries: [animals, colors, numbers],
    separator: '',
    style: 'lowerCase',
    length: 3,
  });
};

module.exports.fakeArtistResults = [
  {
    artistId: 6665,
    artistScore: 78.706,
    buzzPoints: 39,
    rankChange: 0,
    socialPoints: 10,
    streamingPoints: 8,
    videoPoints: 21,
    artistName: 'Jason Derulo',
    artistPhoto: 'https://i.scdn.co/image/300b459748ce4d11ce1e222eb3d7dff8e854d6da',
    genreName: 'R&B',
    spotifyId: '07YZf4WDAMNwqr4jfgOZ8y',
    twitterUrl: 'https://twitter.com/jasonderulo',
    twitterId: '28076276',
  },
  {
    artistId: 8407,
    artistScore: 94.593,
    buzzPoints: 64,
    rankChange: -1,
    socialPoints: 14,
    streamingPoints: 26,
    videoPoints: 24,
    artistName: 'The Weeknd',
    artistPhoto: 'https://i.scdn.co/image/d9a875c37277c35b94c60c00d2cd256db098505d',
    genreName: 'Pop',
    spotifyId: '1Xyo4u8uXC1ZmMpatF05PJ',
    twitterUrl: 'https://twitter.com/theweeknd',
    twitterId: '255388236',
  },
];

module.exports.fakeYoutubeChannelData = [
  {
    youtubeSubscribers: 9170000,
    videos: 163,
    views: 8786357916,
    youtubeBanner:
      'https://yt3.ggpht.com/6yTfkuLEoy47TyQS7eNMPkZwMX7exNUnQcxQFRD3wkk8MLaK4NKgb4iRUdZ2bH8Ta7ncx70v=w640-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj',
    youtubeAvatar: 'https://yt3.ggpht.com/a/AGF-l7_8Pn6LiksWDxEANWHtG0WM7M2zLGvDDv-Vpg=s88-c-k-c0xffffffff-no-rj-mo',
    artistId: 6681,
  },
];

module.exports.fakeYoutubeVideos = [
  {
    videoUrl: 'http://youtube.com/watch?v=U4VUEdlaxhU',
    videoTitle: 'Lady Gaga - Chromatica III (Audio)',
    videoCreateDate: '2020-05-29T09:00:24.000Z',
  },
  {
    videoUrl: 'http://youtube.com/watch?v=bOuuMmlf_DE',
    videoTitle: 'Lady Gaga - Babylon (Audio)',
    videoCreateDate: '2020-05-29T09:00:20.000Z',
  },
  {
    videoUrl: 'http://youtube.com/watch?v=zWzBcrniDRw',
    videoTitle: 'Lady Gaga - Fun Tonight (Audio)',
    videoCreateDate: '2020-05-29T09:00:20.000Z',
  },
];

module.exports.fakeTweets = [
  {
    tweetId: '1263519107237871617',
    timeStamp: '2020-05-21T22:16:44.000Z',
  },
  {
    tweetId: '1263681577252343811',
    timeStamp: '2020-05-22T09:02:20.000Z',
  },
  {
    tweetId: '1263682451546599426',
    timeStamp: '2020-05-22T09:05:49.000Z',
  },
  {
    tweetId: '1263682904569200640',
    timeStamp: '2020-05-22T09:07:37.000Z',
  },
  {
    tweetId: '1263683051025911809',
    timeStamp: '2020-05-22T09:08:12.000Z',
  },
];

module.exports.fakeNews = [
  {
    image_file: 'https://i.scdn.co/image/d9ae12e3a1ce7fcf169fb494ccc9b05769ab314d',
    artist_name: 'Lady Gaga',
    id: 943642,
    news_feed_id: 4,
    title: "Lady Gaga 'Chromatica' Release Date Now 5/29 - Stereogum",
    link: 'https://www.stereogum.com/2083513/lady-gaga-chromatica-release-date-change/news/',
    timeStamp: '2020-05-06T21:12:00.000Z',
    description:
      "Lady Gaga was one of the first major artists to postpone the release date of a scheduled album due to the coronavirus pandemic. But she's just announced a new release date for her first new album in four years, Chromatica. It'll now be out on 5/29, so a littlâ€¦",
    image:
      'https://static.stereogum.com/uploads/2020/05/lady-gaga-chromatica-tracklist-1587575038-640x640-1588781475-608x608.jpg',
  },
  {
    image_file: 'https://i.scdn.co/image/d9ae12e3a1ce7fcf169fb494ccc9b05769ab314d',
    artist_name: 'Lady Gaga',
    id: 943642,
    news_feed_id: 4,
    title: "Lady Gaga 'Chromatica' Release Date Now 5/29 - Stereogum",
    link: 'https://www.stereogum.com/2083513/lady-gaga-chromatica-release-date-change/news/',
    timeStamp: '2020-05-06T21:12:00.000Z',
    description:
      "Lady Gaga was one of the first major artists to postpone the release date of a scheduled album due to the coronavirus pandemic. But she's just announced a new release date for her first new album in four years, Chromatica. It'll now be out on 5/29, so a littlâ€¦",
    image:
      'https://static.stereogum.com/uploads/2020/05/lady-gaga-chromatica-tracklist-1587575038-640x640-1588781475-608x608.jpg',
  },
];

module.exports.fakeUserFeedPrefs = [
  {
    artist_id: 8662,
    video_flag: 1,
    tweet_flag: 1,
    news_flag: 1,
    artistName: 'Dua Lipa',
    artistPhoto: 'https://i.scdn.co/image/330f9806621bc0fe67f5c06f2f1f8df53d011b4e',
  },
  // {
  //   artist_id: 13652,
  //   video_flag: 0,
  //   tweet_flag: 0,
  //   news_flag: 1,
  //   artistName: 'J Balvin',
  //   artistPhoto: 'https://i.scdn.co/image/ae3600b01af301d517ac1426cccd4e613f335545'
  // },
];

module.exports.fakeSetFeedResponse = {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 0,
  serverStatus: 2,
  warningCount: 0,
  message: '',
  protocol41: true,
  changedRows: 0,
};

module.exports.fakeSetFeedRequestBody = {
  artistIds: [{ artistId: 6681, Video: true, Twitter: true, News: true }],
};

module.exports.fakeSpotifyTopArtistResponse = {
  data: {
    items: [
      {
        external_urls: {
          spotify: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ',
        },
        followers: { href: null, total: 20813435 },
        genres: ['canadian contemporary r&b', 'canadian pop', 'pop'],
        href: 'https://api.spotify.com/v1/artists/1Xyo4u8uXC1ZmMpatF05PJ',
        id: '1Xyo4u8uXC1ZmMpatF05PJ',
        images: [[Object], [Object], [Object]],
        name: 'The Weeknd',
        popularity: 97,
        type: 'artist',
        uri: 'spotify:artist:1Xyo4u8uXC1ZmMpatF05PJ',
      },
    ],
  },
};

module.exports.findSpotifyArtistResponse = [{ id: 1234 }];
