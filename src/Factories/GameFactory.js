const { RoundFactory } = require('./RoundFactory');

module.exports.GameFactory = {
  Game(mode) {
    return Object.create(this.mode[mode]);
  },
  mode: {
    pickem: {
      _artists: [],

      _secondaryArtists: [],

      get artists() {
        return this._artists;
      },

      set artists(artists) {
        this._artists = artists;
      },

      get secondaryArtists() {
        return this._secondaryArtists;
      },

      set secondaryArtists(secondaryArtists) {
        this._secondaryArtists = secondaryArtists;
      },

      set numQuestions(num_questions) {
        this._num_questions = num_questions;
      },

      get numQuestions() {
        return this._num_questions;
      },

      set numRounds(num_rounds) {
        this._num_rounds = num_rounds;
      },

      get numRounds() {
        return this._num_rounds;
      },

      set selectedGenre(genre) {
        this.selected_genre = genre;
      },

      get selectedGenre() {
        return this.selected_genre;
      },

      generateRoundQuestions(round_number) {
        const Round = RoundFactory.Round(round_number);
        Round.artistPool = this.artists;
        if (this.selectedGenre !== undefined) {
          Round.selectedGenre = this.selectedGenre;
        }

        if (this.secondaryArtists.length > 0) {
          Round.secondaryArtistPool = this.secondaryArtists;
        }

        return Round.generateQuestions(this.numQuestions);
      },
    },
  },
};
