const {
  COUNT_SCORE,
  CREATE_GAME,
  END_GAME,
  GET_ALL_PICKEMARTISTS,
  GET_GAME_DATA,
  GET_INPROGRESS_GAME,
  GET_QUESTION_ARTISTDATA,
  INSERT_GAME_ROUND_PARTIAL,
  SELECT_LAST_GAMEROUND,
  SELECT_PICKEM_ARTISTS,
  SET_HIGHSCORE,
  UPDATE_GAME_ROUND_PARTIAL,
} = require('../Queries');
const { GameFactory } = require('../Factories/GameFactory');
const { TransactionsService } = require('../Services/Transactions/TransactionsService');
const Tools = require('../Tools');
const { pool: connection } = require('../../database/MYSQL_database');

// module wide variables
const questions = 6;
const rounds = 6;
//

module.exports.getInProgressPickem = function (request, response) {
  const headers = request.headers;
  const token = Tools.getUserIdFromToken(headers.authorization);
  const userId = token.toString();

  _getInProgressGame(userId).then((last_round_data) => {
    response.json(last_round_data);
  });
};

module.exports.startPickemGame = async (request, response) => {
  const headers = request.headers;
  const token = Tools.getUserIdFromToken(headers.authorization);
  const userId = token.toString();

  const result = await Tools.promisifiedQuery(CREATE_GAME, {
    user: userId,
    rounds,
    questions,
  });

  const [game] = await Tools.promisifiedQuery(GET_GAME_DATA, {
    user: userId,
    game: result.insertId,
    rounds,
    questions,
  });

  const roundQuestions = await getRoundQuestions(1, userId);

  await insertRoundQuestions(game.game_id, 1, roundQuestions);

  return response.send({
    gameId: game.game_id,
    timeStarted: game.time_created,
    questions: roundQuestions,
  });
};

module.exports.answerPickemRound = async (req, res) => {
  const userId = Tools.getUserIdFromToken(req.headers.authorization);
  const answers = req.body.Answers;
  const { selectedGenre } = req.body;
  const { gameId } = req.params;

  if (answers.length === undefined || answers.length < 1) {
    console.log('Missing Mandatory Answers payload');
    return res.status(400).send();
  }

  // get game data to see what round we're resolving
  const data = await _getLastGameRoundQuery(gameId);
  const current_round = data[0].round_id;
  const next_round = current_round + 1;
  let updateAnswers = [];
  let gameend = data[0].time_completed !== null;

  if (!gameend) {
    updateAnswers = updateRoundAnswers(gameId, current_round, answers);
  }

  // if in the final round, end the game
  if (current_round === data[0].number_rounds) {
    await _endGameQuery(gameId);
    gameend = true;
  } else {
    // validate answers
    for (let i = 0, end = answers.length; i < end; i++) {
      const answer = answers[i];
      if (answer.userSelection !== data[i].artistid_solution) {
        // wrong answer, end the game
        await _endGameQuery(gameId);
        gameend = true;
        break;
      }
    }
  }

  if (gameend) {
    await Promise.all(updateAnswers);
    // score is calculated after answers are updated
    const score = await _calculateScoreQuery(gameId);
    await Promise.all([_setHighscoreQuery(score, userId)]);

    await TransactionsService.insertBuzzbeatCompletedAward(userId, gameId);

    return res.json({
      gameComplete: true,
      score,
    });
  } else {
    const parameters = {
      round: next_round,
      userId: userId,
      gameId: gameId,
      time_created: data[0].time_created,
      genre: selectedGenre,
    };
    createNewRound(parameters).then((data) => res.json(data));
  }
};

function createNewRound(parameters) {
  const roundQuestions = getRoundQuestions(parameters.round, parameters.userId, parameters.genre);
  const payload = {};
  payload['gameId'] = parameters.gameId;
  payload['timeStarted'] = parameters.time_created;
  payload['round'] = parameters.round;

  return Promise.all([payload, roundQuestions]).then(function (values) {
    return new Promise(function (resolve, reject) {
      const payload = values[0];
      const roundQuestions = values[1];

      insertRoundQuestions(payload.gameId, payload.round, roundQuestions).then(() => {
        payload['questions'] = roundQuestions;
        resolve(payload);
      });
    });
  });
}

function updateRoundAnswers(game_id, round_number, answers) {
  //iterate and execute the update query for the questions -
  //returning the corresponding promises in an array

  const queries = [];
  for (let i = 0, end = answers.length; i < end; i++) {
    const answer = answers[i];

    const parameters = {
      game: game_id,
      round: round_number,
      question: i + 1,
      guess: answer.userSelection,
    };

    queries.push(_updateRoundAnswerQuery(parameters));
  }
  return queries;
}

function insertRoundQuestions(game_id, round_number, questions) {
  //iterate and execute the insert query for the questions -
  //returning the corresponding promises in an array
  return Promise.all(
    questions.map((question, i) => {
      return _insertRoundQuestionQuery({
        game_id: game_id,
        round_number: round_number,
        question_number: i + 1,
        artistid_solution: question.ArtistSolution,
        artistid_nonsolution: question.ArtistNonsolution,
        date_solution: question.dateArtistSolution,
        date_nonsolution: question.dateArtistNonsolution,
      });
    }),
  );
}

function getRoundQuestions(roundNumber, userId, selectedGenre) {
  const roundOne = function () {
    return new Promise(function (resolve, reject) {
      _getMyPickemArtistsQuery(userId).then((values) => {
        if (values.length < 12) {
          //if user doesn't have enough artists to fill round 1

          _getTopArtistsQuery().then((values2) => {
            const PickemGame = GameFactory.Game('pickem');
            PickemGame.numQuestions = questions;
            PickemGame.numRounds = rounds;

            PickemGame.artists = values;
            PickemGame.secondaryArtists = values2;

            const roundQuestions = PickemGame.generateRoundQuestions(1);
            resolve(roundQuestions);
          });
        } else {
          const PickemGame = GameFactory.Game('pickem');
          PickemGame.numQuestions = questions;
          PickemGame.numRounds = rounds;

          PickemGame.artists = values;

          const roundQuestions = PickemGame.generateRoundQuestions(1);
          resolve(roundQuestions);
        }
      });
    });
  };

  const roundTwo = function () {
    return new Promise(function (resolve, reject) {
      const sortTopArtists = 'ORDER BY ds.daily_points DESC LIMIT 50';

      Promise.all([_getMyPickemArtistsQuery(userId), _getTopArtistsQuery(sortTopArtists)]).then(
        function (values) {
          //need genre values
          const myArtists = values[0];
          const topArtists = values[1];

          const PickemGame = GameFactory.Game('pickem');
          PickemGame.numQuestions = questions;
          PickemGame.numRounds = rounds;

          PickemGame.artists = myArtists;
          PickemGame.secondaryArtists = topArtists;

          const roundQuestions = PickemGame.generateRoundQuestions(2);
          resolve(roundQuestions);
        },
      );
    });
  };

  const roundThree = function () {
    return new Promise(function (resolve, reject) {
      Promise.all([_getMyPickemArtistsQuery(userId), _getTopArtistsQuery()]).then(function (
        values,
      ) {
        //need genre values
        const myArtists = values[0];
        const topArtists = values[1];

        const PickemGame = GameFactory.Game('pickem');
        PickemGame.numQuestions = questions;
        PickemGame.numRounds = rounds;

        PickemGame.artists = myArtists;
        PickemGame.secondaryArtists = topArtists;

        const roundQuestions = PickemGame.generateRoundQuestions(3);
        resolve(roundQuestions);
      });
    });
  };

  const roundFour = function () {
    return new Promise(function (resolve, reject) {
      Promise.all([_getMyPickemArtistsQuery(userId), _getTopArtistsQuery()]).then(function (
        values,
      ) {
        //need genre values
        const myArtists = values[0];
        const topArtists = values[1];

        const PickemGame = GameFactory.Game('pickem');
        PickemGame.numQuestions = questions;
        PickemGame.numRounds = rounds;
        PickemGame.selectedGenre = selectedGenre;

        PickemGame.artists = myArtists;
        PickemGame.secondaryArtists = topArtists;

        const roundQuestions = PickemGame.generateRoundQuestions(4);
        resolve(roundQuestions);
      });
    });
  };

  const roundFive = function () {
    return new Promise(function (resolve, reject) {
      Promise.all([_getMyPickemArtistsQuery(userId), _getTopArtistsQuery()]).then(function (
        values,
      ) {
        //need genre values
        const myArtists = values[0];
        const topArtists = values[1];

        const PickemGame = GameFactory.Game('pickem');
        PickemGame.numQuestions = questions;
        PickemGame.numRounds = rounds;
        PickemGame.selectedGenre = selectedGenre;

        PickemGame.artists = myArtists;
        PickemGame.secondaryArtists = topArtists;

        const roundQuestions = PickemGame.generateRoundQuestions(5);
        resolve(roundQuestions);
      });
    });
  };

  const roundSix = function () {
    return new Promise(function (resolve, reject) {
      Promise.all([_getMyPickemArtistsQuery(userId), _getTopArtistsQuery()]).then(function (
        values,
      ) {
        //need genre values
        const myArtists = values[0];
        const topArtists = values[1];

        const PickemGame = GameFactory.Game('pickem');
        PickemGame.numQuestions = questions;
        PickemGame.numRounds = rounds;
        PickemGame.selectedGenre = selectedGenre;

        PickemGame.artists = myArtists;
        PickemGame.secondaryArtists = topArtists;

        const roundQuestions = PickemGame.generateRoundQuestions(6);
        resolve(roundQuestions);
      });
    });
  };

  switch (true) {
    case roundNumber === 1:
      return roundOne();

    case roundNumber === 2:
      return roundTwo();

    case roundNumber === 3:
      return roundThree();

    case roundNumber === 4:
      return roundFour();

    case roundNumber === 5:
      return roundFive();

    case roundNumber === 6:
      return roundSix();
  }
}

//Start helper promise based query wrappers //////////////////

function _insertRoundQuestionQuery(parameters) {
  return Tools.promisifiedQuery(
    INSERT_GAME_ROUND_PARTIAL,
    {
      game: parameters.game_id,
      round: parameters.round_number,
      question: parameters.question_number,
      artistid_guess: null,
      time: null,
      artistid_solution: parameters.artistid_solution,
      artistid_nonsolution: parameters.artistid_nonsolution,
      date_solution: parameters.date_solution,
      date_nonsolution: parameters.date_nonsolution,
    },
    'PickemControllers _insertRoundQuestionQuery() INSERT_GAME_ROUND_PARTIAL error: ',
  );
}

function _getTopArtistsQuery(extraQuery) {
  return new Promise(function (resolve, reject) {
    const query = extraQuery ? GET_ALL_PICKEMARTISTS + extraQuery : GET_ALL_PICKEMARTISTS;

    connection.query(
      query,
      {},

      (error, results, fields) => {
        if (error) {
          reject(new Error(`get all artists data error *****: ${error}`, error));
        }

        results = results.map((item) => {
          return { ...item };
        });

        resolve(results);
      },
    );
  });
}

async function _getMyPickemArtistsQuery(userId) {
  return Tools.promisifiedQuery(SELECT_PICKEM_ARTISTS, {
    user: userId,
    userPrime: userId,
  });
}

function _getLastGameRoundQuery(gameId) {
  return new Promise(function (resolve, reject) {
    connection.query(
      SELECT_LAST_GAMEROUND,
      {
        game: gameId,
        game_prime: gameId,
      },

      (error, results, fields) => {
        if (error) {
          reject(new Error(`SELECT_LAST_GAMEROUND data error *****: ${error}`, error));
        }

        results = results.map((item) => {
          return { ...item };
        });

        resolve(results);
      },
    );
  });
}

function _updateRoundAnswerQuery(parameters) {
  return new Promise(function (resolve, reject) {
    connection.query(
      UPDATE_GAME_ROUND_PARTIAL,
      {
        game: parameters.game,
        round: parameters.round,
        artistid_guess: parameters.guess,
        question: parameters.question,
      },

      (error, results, fields) => {
        if (error) {
          console.log('update round answer query error ****', error);

          reject(new Error(`UPDATE_GAME_ROUND_PARTIAL data error *****: ${error}`, error));
        }

        resolve(true);
      },
    );
  });
}

function _endGameQuery(gameid) {
  return new Promise(function (resolve, reject) {
    connection.query(
      END_GAME,
      {
        game: gameid,
      },

      (error, results, fields) => {
        if (error) {
          reject(new Error(`END_GAME data error *****: ${error}`, error));
        }

        resolve(results);
      },
    );
  });
}

function _setHighscoreQuery(score, userId) {
  return new Promise(function (resolve, reject) {
    connection.query(
      SET_HIGHSCORE,
      {
        user: userId,
        score: score,
        scoreTest: score,
        scorePrime: score,
      },

      (error, results, fields) => {
        if (error) {
          reject(new Error(`SET_HIGHSCORE data error *****: ${error}`, error));
        }

        resolve(results);
      },
    );
  });
}

function _calculateScoreQuery(gameid) {
  return new Promise(function (resolve, reject) {
    connection.query(
      COUNT_SCORE,
      {
        game: gameid,
      },

      (error, results, fields) => {
        if (error) {
          reject(new Error(`COUNT_SCORE data error *****: ${error}`, error));
        }

        resolve(results[0]['Count(*)']);
      },
    );
  });
}

function _getInProgressGame(user_id) {
  return new Promise(function (resolve, reject) {
    connection.query(
      GET_INPROGRESS_GAME,
      {
        user: user_id,
      },

      async (error, results, fields) => {
        if (error) {
          reject(new Error(`GET_INPROGRESS_GAME data error *****: ${error}`, error));
        }

        if (!results.length) {
          resolve(results);
        }

        const gameId = results[0]['game_id'];
        const timeStarted = results[0]['time_created'];
        const questions = results.map((item) => {
          const result = { ...item };
          delete result.time_created;
          delete result.game_id;
          delete result.question_number;
          delete result.number_rounds;
          delete result.number_questions;

          return result;
        });

        for (let i = questions.length - 1; i >= 0; i--) {
          const question = questions[i];

          const questionArtistData = await _getQuestionArtistData(question);

          questions[i] = {
            Artist1: questionArtistData[0],

            Artist2: questionArtistData[1],

            ...question,
          };
        }

        const response = {
          gameId: gameId,
          timeStarted: timeStarted,
          questions: questions,
        };

        resolve(response);
      },
    );
  });
}

function _getQuestionArtistData(parameters) {
  return new Promise(function (resolve, reject) {
    connection.query(
      GET_QUESTION_ARTISTDATA,
      {
        artist_solution: parameters.ArtistSolution,
        date_solution: parameters.dateArtistSolution,
        artist_nonsolution: parameters.ArtistNonsolution,
        date_nonsolution: parameters.dateArtistNonsolution,
      },

      (error, results, fields) => {
        if (error) {
          reject(new Error(`GET_QUESTION_ARTISTDATA data error *****: ${error}`, error));
        }

        resolve(
          results.map((item) => {
            return { ...item };
          }),
        );
      },
    );
  });
}
