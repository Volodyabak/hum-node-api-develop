const deepCopy = (inObject) => {
  let value, key;

  if (typeof inObject !== 'object' || inObject === null) {
    return inObject; // Return the value if in object is not an object
  }

  // Create an array or object to hold the values
  const outObject = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = inObject[key];

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopy(value);
  }

  return outObject;
};

//round agnostic implementation details, outside scope required for nested object access
const _common = {
  _artistPool: [],

  _secondaryArtistPool: [],

  set artistPool(artistPool) {
    this._artistPool = artistPool;
  },

  get artistPool() {
    return this._artistPool;
  },

  set secondaryArtistPool(secondaryArtistPool) {
    this._secondaryArtistPool = secondaryArtistPool;
  },

  get secondaryArtistPool() {
    return this._secondaryArtistPool;
  },

  generateQuestions(number = 1) {
    const questions = [];
    this.number = number;

    for (let i = number - 1; i >= 0; i--) {
      const artist_pair = this._getArtistPairing();

      questions.push(this.solveArtistPair(artist_pair.artist_a, artist_pair.artist_b));
    }

    return questions;
  },

  solveArtistPair(artist_a, artist_b) {
    if (artist_a === undefined || artist_b === undefined) {
      return null;
    }

    let correct, incorrect;
    const solution = {
      Artist1: {
        artistName: artist_a.artist_name,
        artistId: artist_a.artist_id,
        artistPhoto: artist_a.artist_photo,
        buzzPoints: artist_a.daily_points,
        rankChange: artist_a.direction,
        videoPoints: artist_a.videoPoints,
        socialPoints: artist_a.socialPoints,
        streamingPoints: artist_a.streamingPoints,
        spotifyId: artist_a.spotifyId,
        genreName: artist_a.genre_name,
        status: artist_a.status,
      },
      Artist2: {
        artistName: artist_b.artist_name, //trigger
        artistId: artist_b.artist_id,
        artistPhoto: artist_b.artist_photo,
        buzzPoints: artist_b.daily_points,
        rankChange: artist_b.direction,
        videoPoints: artist_b.videoPoints,
        socialPoints: artist_b.socialPoints,
        streamingPoints: artist_b.streamingPoints,
        spotifyId: artist_b.spotifyId,
        genreName: artist_b.genre_name,
        status: artist_b.status,
      },
      ArtistSolution: undefined,
      ArtistNonsolution: undefined,
      dateArtistSolution: undefined,
      dateArtistNonsolution: undefined,
    };

    const notEqualPoints = artist_a.daily_points != artist_b.daily_points;
    if (notEqualPoints) {
      const aBigger = artist_a.daily_points > artist_b.daily_points;

      if (aBigger) {
        correct = artist_a;
        incorrect = artist_b;
      } else {
        correct = artist_b;
        incorrect = artist_a;
      }
    } else {
      const notEqualDirection = artist_a.direction != artist_b.direction;
      if (notEqualDirection) {
        const aBigger = artist_a.direction > artist_b.direction;

        if (aBigger) {
          correct = artist_a;
          incorrect = artist_b;
        } else {
          correct = artist_b;
          incorrect = artist_a;
        }
      } else {
        console.log('********* uh oh ********');
        // same direction
        //what do??
      }
    }

    solution.ArtistSolution = correct.artist_id;
    solution.ArtistNonsolution = incorrect.artist_id;

    solution.dateArtistSolution = correct.date;
    solution.dateArtistNonsolution = incorrect.date;

    return solution;
  },

  _validatePair(pair) {
    // Ensure referenced pair have different points or direction
    if (Math.abs(pair.artist_a.daily_points - pair.artist_b.daily_points) < 1) {
      if (this.secondaryArtistPool.length) {
        this.artistPool.push(pair.artist_a);
        this.secondaryArtistPool.push(pair.artist_b);
      } else {
        this.artistPool.push(pair.artist_a);
        this.artistPool.push(pair.artist_b);
      }

      //defer to round specific implementation
      pair = this._getArtistPairing(pair);
    }
  },
};

const _common_genrefunctions = {
  _mapGenreFrequency(artistList) {
    return artistList.reduce(function (acc, curr) {
      if (typeof acc[curr.genre_name] === 'undefined') {
        acc[curr.genre_name] = 1;
      } else {
        acc[curr.genre_name] += 1;
      }

      return acc;
    }, {});
  },

  _supportedGenres() {
    return ['Pop', 'Hip-Hop', 'Rock', 'R&B', 'Country'];
  },

  _filterArtistListGenre(artistlist) {
    const supported_genres = this._supportedGenres();

    return artistlist.filter(function (index) {
      if (supported_genres.includes(index.genre_name)) {
        return index;
      }
    });
  },

  _userHasGenre(genre) {
    const artistList = [...this.artistPool];
    const genres = [];
    artistList.filter((item) => {
      if (item.genre_name === genre) {
        genres.push(item.genre_name);
      }
    });
    const hasGenre = genres.includes(genre);
    return hasGenre;
  },

  _findGreatestLeastGenres(artistList) {
    const filtered_artistlist = this._filterArtistListGenre(artistList);

    const genre_frequencies = this._mapGenreFrequency(filtered_artistlist);

    let least = { genre: '', count: Infinity };
    let greatest = { genre: '', count: 0 };

    Object.entries(genre_frequencies).forEach(function (item) {
      if (item[1] > greatest.count) {
        greatest = { genre: item[0], count: item[1] };
      }

      if (item[1] < least.count) {
        least = { genre: item[0], count: item[1] };
      }
    });

    return { greatest: greatest.genre, least: least.genre };
  },

  _findArtistWithGenre(genre, artistlist, roundNumber) {
    //added roundNumber arguement to differentiate round 3

    if (artistlist === undefined || artistlist === null) {
      artistlist = this.artistPool;
    }

    if (artistlist.length === 0) {
      artistlist = this.secondaryArtistPool;
    }

    let index = 0;
    //creates a copy of artist pool for round 3, as round 3 does not rely on a single genre
    const pool = roundNumber === 3 ? [...artistlist] : artistlist;

    while (pool.length && pool[(index = Math.floor(Math.random() * pool.length))].genre_name != genre) {
      pool.splice(index, 1);
    }

    if (pool.length) {
      const artist = pool.splice(index, 1)[0];
      let artistListIndex;

      if (roundNumber === 3) {
        artistListIndex = artistlist.findIndex((item) => item.artist_id === artist.artist_id);

        return artistlist.splice(artistListIndex, 1)[0];
      }

      return artist;
    }

    return null;
  },
};

module.exports.RoundFactory = {
  Round(round_number) {
    return deepCopy(this.settings[round_number]);
  },

  settings: {
    1: {
      // yield common properties
      ..._common,

      _getArtistPairing() {
        const getArtist = () => {
          if (this.artistPool.length) {
            return this.artistPool.splice(Math.floor(Math.random() * this.artistPool.length), 1)[0];
          } else {
            return this.secondaryArtistPool.splice(Math.floor(Math.random() * this.secondaryArtistPool.length), 1)[0];
          }
        };

        this.pair = {
          //account for situations where user doesn't have enough artists to populate a whole round
          artist_a: getArtist(),
          artist_b: getArtist(),
        };

        this._validatePair(this.pair);

        return this.pair;
      },
    },
    2: {
      // yield common properties
      ..._common,

      _getArtistPairing() {
        const getArtist = () => {
          if (this.artistPool.length) {
            return this.artistPool.splice(Math.floor(Math.random() * this.artistPool.length), 1)[0];
          } else {
            return this.secondaryArtistPool.splice(Math.floor(Math.random() * this.secondaryArtistPool.length), 1)[0];
          }
        };

        this.pair = {
          //account for situations where user doesn't have enough artists to populate a whole round
          artist_a: getArtist(),
          artist_b: getArtist(),
        };

        this._validatePair(this.pair);

        return this.pair;
      },
    },
    3: {
      // yield common properties
      ..._common,
      ..._common_genrefunctions,

      _getArtistPairing() {
        let selected_genre, genrefreq_artists, genrefreq_topartists;

        //ToDo: could be refactored to use getters and setters
        if (genrefreq_artists === undefined) {
          const filtered_artistlist = this._filterArtistListGenre(
            this.artistPool.length > 0 ? this.artistPool : this.secondaryArtistPool
          );

          genrefreq_artists = this._mapGenreFrequency(filtered_artistlist);
        }

        if (genrefreq_topartists === undefined) {
          const filtered_topartistlist = this._filterArtistListGenre(this.secondaryArtistPool);

          genrefreq_topartists = this._mapGenreFrequency(filtered_topartistlist);
        }

        if (!selected_genre) {
          const genres = this._supportedGenres();

          while (!selected_genre) {
            const random_genre = genres[Math.floor(Math.random() * genres.length)];

            if (genrefreq_artists[random_genre] && genrefreq_topartists[random_genre]) {
              selected_genre = random_genre;
            }
          }
        }

        const greatest_artist = this._findArtistWithGenre(
          selected_genre,
          this.artistPool.length > 0 ? null : this.secondaryArtistPool,
          3
        );
        const least_artist = this._findArtistWithGenre(selected_genre, this.secondaryArtistPool, 3);

        if (greatest_artist && least_artist) {
          this.pair = {
            artist_a: greatest_artist,
            artist_b: least_artist,
          };

          if (
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) > 10 ||
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) < 1
          ) {
            this.artistPool.push(this.pair.artist_a);
            this.secondaryArtistPool.push(this.pair.artist_b);

            this.pair = this._getArtistPairing();
          }

          this._validatePair(this.pair);

          return this.pair;
        } else {
          if (this.pair.artist_a) {
            this.artistPool.push(this.pair.artist_a);
          }
          if (this.pair.artist_b) {
            this.secondaryArtistPool.push(this.pair.artist_b);
          }

          this.pair = this._getArtistPairing();

          this._validatePair(this.pair);

          return this.pair;
        }
      },
    },

    4: {
      // yield common properties
      ..._common,
      ..._common_genrefunctions,

      _getArtistPairing() {
        const userHasGenre = this._userHasGenre(this.selectedGenre);

        const artistA = !userHasGenre
          ? this._findArtistWithGenre(this.selectedGenre, this.secondaryArtistPool)
          : this._findArtistWithGenre(this.selectedGenre);
        const artistB = this._findArtistWithGenre(this.selectedGenre, this.secondaryArtistPool);

        if (artistA !== undefined && artistB !== undefined) {
          this.pair = {
            artist_a: artistA,
            artist_b: artistB,
          };

          if (
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) > 20 ||
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) < 1
          ) {
            this.artistPool.push(this.pair.artist_a);
            this.secondaryArtistPool.push(this.pair.artist_b);

            this.pair = this._getArtistPairing();
          }

          this._validatePair(this.pair);

          return this.pair;
        } else {
          this.pair = {
            artist_a: this.artistPool.splice(Math.floor(Math.random() * this.artistPool.length), 1)[0],
            artist_b: this.secondaryArtistPool.splice(
              Math.floor(Math.random() * this.secondaryArtistPool.length),
              1
            )[0],
          };

          if (
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) > 20 ||
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) < 1
          ) {
            this.artistPool.push(this.pair.artist_a);
            this.secondaryArtistPool.push(this.pair.artist_b);

            this.pair = this._getArtistPairing();
          }

          this._validatePair(this.pair);

          return this.pair;
        }
      },
    },

    5: {
      // yield common properties
      ..._common,
      ..._common_genrefunctions,

      _getArtistPairing() {
        const userHasGenre = this._userHasGenre(this.selectedGenre);
        //if the selected genre is not represented in the users artist pool, pull from secondaryArtistPool
        const artistA = !userHasGenre
          ? this._findArtistWithGenre(this.selectedGenre, this.secondaryArtistPool)
          : this._findArtistWithGenre(this.selectedGenre);
        const artistB = this._findArtistWithGenre(this.selectedGenre, this.secondaryArtistPool);

        if (artistA != undefined && artistB != undefined) {
          this.pair = {
            artist_a: artistA,
            artist_b: artistB,
          };

          if (
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) > 10 ||
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) < 1
          ) {
            if (!userHasGenre) {
              this.secondaryArtistPool.push(this.pair.artist_a);
            } else {
              this.artistPool.push(this.pair.artist_a);
            }
            this.secondaryArtistPool.push(this.pair.artist_b);

            this.pair = this._getArtistPairing();
          }

          this._validatePair(this.pair);

          return this.pair;
        } else {
          this.pair = {
            artist_a: this.artistPool.splice(Math.floor(Math.random() * this.artistPool.length), 1)[0],
            artist_b: this.secondaryArtistPool.splice(
              Math.floor(Math.random() * this.secondaryArtistPool.length),
              1
            )[0],
          };

          if (
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) > 20 ||
            Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) < 1
          ) {
            this.artistPool.push(this.pair.artist_a);
            this.secondaryArtistPool.push(this.pair.artist_b);

            this.pair = this._getArtistPairing();
          }

          this._validatePair(this.pair);

          return this.pair;
        }
      },
    },

    6: {
      // yield common properties
      ..._common,
      ..._common_genrefunctions,

      _getArtistPairing() {
        //ToDo: could be refactored to use getters and setters
        const artistA = this._findArtistWithGenre(this.selectedGenre, this.secondaryArtistPool);
        const artistB = this._findArtistWithGenre(this.selectedGenre, this.secondaryArtistPool);

        this.pair = {
          artist_a: artistA,
          artist_b: artistB,
        };

        if (
          this.pair.artist_a === null ||
          this.pair.artist_b === null ||
          Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) > 10 ||
          Math.abs(this.pair.artist_a.daily_points - this.pair.artist_b.daily_points) < 1
        ) {
          if (this.pair.artist_a !== null) {
            this.secondaryArtistPool.push(this.pair.artist_a);
          }

          if (this.pair.artist_b !== null) {
            this.secondaryArtistPool.push(this.pair.artist_b);
          }

          this.pair = this._getArtistPairing();
        }

        this._validatePair(this.pair);

        return this.pair;
      },
    },
  },
};
