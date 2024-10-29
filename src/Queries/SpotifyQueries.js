module.exports = {
  INSERT_USER_SPOTIFY_ARTIST: `
      INSERT
      IGNORE INTO labl.user_spotify_artist(user_id, spotify_artist_id)
      VALUES (:userId, :artistId);
  `,
};
