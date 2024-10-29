export const GET_USER_ARTISTS = `
  SELECT a.*,
         IFNULL(g.genre_name, '')                as genreName,
         IF(ufp1.artist_id IS NULL, FALSE, TRUE) as isFollowing
  FROM ean_collection.artist a
         JOIN labl.user_feed_preferences ufp ON a.id = ufp.artist_id
         LEFT JOIN labl.user_feed_preferences ufp1
                   ON ufp1.user_id = :tokenUserId
                     AND ufp1.artist_id = ufp.artist_id
         LEFT JOIN labl.daily_scores ds
                   ON (ds.date = (SELECT MAX(date)
                                  FROM labl.daily_scores
                                  WHERE artist_id = ufp.artist_id)
                     AND ds.artist_id = ufp.artist_id)
         LEFT JOIN ean_collection.artist_genre ag ON ag.artist_id = ufp.artist_id
         LEFT JOIN ean_collection.genre g ON g.genre_id = ag.genre_id
  WHERE ufp.user_id = :paramUserId
`;

export const GET_USER_SPOTIFY_TOKENS = `
  SELECT user_id                                  as userId,
         spotify_user_id                          as spotifyUserId,
         account_type                             as accountType,
         AES_DECRYPT(access_token, UNHEX(:hash))  as accessToken,
         AES_DECRYPT(refresh_token, UNHEX(:hash)) as refreshToken,
         last_updated                             as lastUpdated,
         expire_time                              as expireTime
  FROM \`ean_collection\`.\`spotify_user_tokens\`
  WHERE user_id = :userId
`;

export const UPDATE_SPOTIFY_USER_TOKENS = `
  INSERT INTO \`ean_collection\`.\`spotify_user_tokens\`
    (user_id, refresh_token, access_token, expire_time, last_updated)
  VALUES (:userId,
          AES_ENCRYPT(:refreshToken, UNHEX(:hash)),
          AES_ENCRYPT(:accessToken, UNHEX(:hash)),
          :expireTime,
          CURRENT_TIMESTAMP())
  ON DUPLICATE KEY
    UPDATE refresh_token = AES_ENCRYPT(:refreshToken, UNHEX(:hash)),
           access_token  = AES_ENCRYPT(:accessToken, UNHEX(:hash)),
           last_updated  = CURRENT_TIMESTAMP(),
           expire_time   = :expireTime
`;

export const UPDATE_SPOTIFY_USER_ACCESS_TOKEN = `
  UPDATE \`ean_collection\`.\`spotify_user_tokens\`
  SET access_token = AES_ENCRYPT(:accessToken, UNHEX(:hash)),
      expire_time  = :expireTime,
      last_updated = CURRENT_TIMESTAMP()
  WHERE user_id = :userId
`;
