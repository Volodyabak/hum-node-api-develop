module.exports = {
  GET_USERTOPARTISTS: `
    SELECT a.id                     as artistId,
           ds.daily_points          as buzzPoints,
           ds.direction             as rankChange,
           a.facebook_name          as artistName,
           CASE
             WHEN a.image_file IS NULL
               THEN
               'https://emergingartistnetwork.com/images/no_profile.png'
             ELSE
               CASE
                 WHEN SUBSTRING(a.image_file, 1, 4) = 'http'
                   THEN a.image_file
                 ELSE
                   CONCAT('https://emergingartistnetwork.com/images/', a.image_file)
                 END
             END                    as artistPhoto,
           IFNULL(g.genre_name, '') as genreName,
           a.spotify_artistkey      as spotifyId
    FROM ean_collection.artist a
           JOIN labl.user_feed_preferences ufp ON ufp.artist_id = a.id
           LEFT JOIN ean_collection.artist_scores a_s
                     ON a.id = a_s.artist_id
                       AND (a_s.run = (SELECT MAX(run)
                                       FROM ean_collection.artist_scores
                                       WHERE artist_id = a.id))
           LEFT JOIN ean_collection.artist_genre ag ON ag.artist_id = a.id
           LEFT JOIN ean_collection.genre g ON ag.genre_id = g.genre_id
           LEFT JOIN labl.daily_scores ds
                     ON ds.date = (SELECT MAX(\`date\`)
                                   FROM \`labl\`.daily_scores)
                       AND ds.artist_id = a.id
    WHERE ufp.user_id = :user;
  `,

  GET_USER_GAME_HISTORY: `
    SELECT gr.game_id,
           COALESCE((SELECT max(lgr.round_id)
                     FROM \`labl\`.\`game_round\` lgr
                     WHERE lgr.game_id = ug.game_id
                       AND lgr.artistid_guess IS NOT NULL
                       AND lgr.artistid_guess = lgr.artistid_solution), 1) as round_number,
           COALESCE((SELECT max(lg.question_number)
                     FROM \`labl\`.\`game_round\` lg
                     WHERE lg.game_id = ug.game_id
                       AND lg.artistid_guess IS NOT NULL
                       AND lg.artistid_guess = lg.artistid_solution
                       AND lg.round_id = round_number), 0)                 as question_number,
           ug.number_questions,
           ug.time_completed
    FROM \`labl\`.\`user_game\` ug
           LEFT JOIN \`labl\`.\`game_round\` gr ON gr.game_id = ug.game_id
    WHERE ug.user_id = :userId
      AND ug.time_completed IS NOT NULL
    GROUP BY gr.game_id, ug.time_completed
    ORDER BY ug.time_completed DESC
  `,

  GET_USER_GENRES: `
    SELECT *
    FROM (SELECT g.genre_name,
                 COUNT(*) / (SELECT COUNT(*)
                             FROM labl.user_feed_preferences ufp2
                                    JOIN ean_collection.artist_genre ag2
                                         ON ag2.artist_id = ufp2.artist_id
                             WHERE ufp2.user_id = :userId) as p
          FROM labl.user_feed_preferences ufp
                 JOIN ean_collection.artist_genre ag ON ag.artist_id = ufp.artist_id
                 JOIN ean_collection.genre g ON g.genre_id = ag.genre_id
          WHERE ufp.user_id = :userId
          GROUP BY ag.genre_id
          ORDER BY p DESC) as sub
    WHERE p > 0.1
    LIMIT 4;
  `,

  GET_USER_MOST_LISTENED_ARTISTS: `
    SELECT a.id as artistId,
           usa.position as 'rank'
    FROM (SELECT user_id, period, position as 'rank', MAX(last_checked) as lastChecked
          FROM \`labl\`.\`user_spotify_artist_full\` usa
          WHERE user_id = :userId
            AND period = 'medium_term'
          GROUP BY position) lc
           JOIN \`labl\`.\`user_spotify_artist_full\` usa
                ON lc.\`rank\` = usa.position
                  AND lc.lastChecked = usa.last_checked
                  AND usa.user_id = lc.user_id
                  AND usa.period = lc.period
           JOIN \`ean_collection\`.\`spotify_artist\` sa
                ON sa.id = usa.spotify_artist_id
           JOIN \`ean_collection\`.\`artist\` a
                ON a.id = sa.artist_id
                  AND a.is_active = 1
    ORDER BY usa.position
    LIMIT :take;
  `,

  GET_USER_TOP_RECENT_TRACKS: `
    SELECT st.id,
           stf.position as 'rank'
    FROM labl.\`user_spotify_track_full\` stf
           JOIN ean_collection.spotify_track st
                ON stf.spotify_track_id = st.id
    WHERE user_id = :userId
      AND period = 'short_term'
      AND stf.date_inserted = (SELECT MAX(date_inserted)
                               FROM labl.\`user_spotify_track_full\`
                               WHERE user_id = :userId
                                 AND period = 'short_term')
    GROUP BY stf.position
    ORDER BY stf.position
    LIMIT :take;
  `,

  GET_USER_BADGES: `
    SELECT b.id    as badgeId,
           b.badge as badgeName
    FROM \`labl\`.\`user_badges\` ub
           JOIN \`labl\`.\`user_badges_checked\` ubc ON ub.user_id = ubc.user_id
           JOIN \`labl\`.\`badges\` b ON ub.badge_id = b.id
    WHERE ub.last_checked >= ubc.last_checked
      AND ub.user_id = :user_id
  `,

  UPDATE_USER_SPOTIFY_TOKEN: `
    INSERT INTO \`ean_collection\`.\`spotify_user_tokens\`
      (user_id, refresh_token, access_token, account_type, last_updated)
    VALUES (:userId, AES_ENCRYPT(:refreshToken, UNHEX(:hash)), AES_ENCRYPT(:accessToken, UNHEX(:hash)), :accountType,
            CURRENT_TIMESTAMP())
    ON DUPLICATE KEY
      UPDATE refresh_token = AES_ENCRYPT(:refreshToken, UNHEX(:hash)),
             access_token  = AES_ENCRYPT(:accessToken, UNHEX(:hash)),
             account_type  = :accountType,
             last_updated  = CURRENT_TIMESTAMP()
  `,

  GET_USER_SPOTIFY_TOKENS: `
    SELECT AES_DECRYPT(access_token, UNHEX(:hash))  AS access_token,
           AES_DECRYPT(refresh_token, UNHEX(:hash)) AS refresh_token
    FROM \`ean_collection\`.\`spotify_user_tokens\`
    WHERE user_id = :id
  `,

  UPDATE_USER_SPOTIFY_ACCESS_TOKEN: `
    UPDATE \`ean_collection\`.\`spotify_user_tokens\`
    SET access_token = AES_ENCRYPT(:accessToken, UNHEX(:hash)),
        last_updated = CURRENT_TIMESTAMP()
    WHERE user_id = :user_id
  `,

  IS_USERNAME_DUPLICATE: `
    SELECT CASE
             WHEN EXISTS
               (SELECT username FROM \`labl\`.\`user_profile_info\` WHERE username = :userName)
               THEN true
             ELSE false
             END nameDuplicate
  `,

  GET_USER_PROFILE: `
    SELECT name                      as fullName,
           username                  as userName,
           DATE(date_inserted)       as joinDate,
           device_type               as deviceType,
           (SELECT COUNT(*)
            FROM \`labl\`.user_feed_preferences
            WHERE user_id = :userId) as followedArtistsCount
    FROM \`ean_collection\`.aws_users
    WHERE sub = :userId;
  `,

  UPDATE_USER_NAME: `
    UPDATE \`ean_collection\`.aws_users
    SET username = :userName
    WHERE sub = :userId
  `,

  UPDATE_USER_FULLNAME: `
    UPDATE \`ean_collection\`.aws_users
    SET name = :userFullName
    WHERE sub = :userId
  `,

  GET_USER_ARTISTS: `
    SELECT ufp.user_id   as userId,
           ufp.artist_id as artistId
    FROM labl.user_feed_preferences ufp
           LEFT JOIN labl.daily_scores ds
                     ON (ds.date = (SELECT MAX(date)
                                    FROM labl.daily_scores
                                    WHERE artist_id = ufp.artist_id)
                       AND ds.artist_id = ufp.artist_id)
    WHERE ufp.user_id = :userId
    ORDER BY ds.daily_points DESC;
  `,
};
