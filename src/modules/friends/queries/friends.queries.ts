export const DISCOVER_FRIEND_TRENDING = `
  SELECT sa.artist_id   artistId,
         sa.artist_name artistName

  FROM labl.\`user_spotify_artist_full\` usa
         JOIN ean_collection.spotify_artist sa ON usa.spotify_artist_id = sa.id
         LEFT JOIN (SELECT sa.artist_id
                    FROM labl.\`user_spotify_artist_full\` usa
                           JOIN ean_collection.spotify_artist sa ON usa.spotify_artist_id = sa.id
                    WHERE user_id = :userId
                      AND period = 'short_term'
                      AND usa.date_inserted = (SELECT max(date_inserted)
                                               FROM labl.\`user_spotify_artist_full\`
                                               WHERE user_id = :userId
                                                 AND period = 'short_term')) sub1
                   ON sub1.artist_id = sa.artist_id
         LEFT JOIN ean_collection.artist_category ac ON ac.artist_id = sa.artist_id AND ac.run =
                                                                                        (SELECT max(run) FROM ean_collection.artist_category)
         LEFT JOIN labl.user_feed_preferences ufp ON sa.artist_id = ufp.artist_id AND ufp.user_id = usa.user_id

  WHERE usa.user_id = :friendId
    AND period = 'short_term'
    AND usa.date_inserted = (SELECT max(date_inserted)
                             FROM labl.\`user_spotify_artist_full\`
                             WHERE user_id = :friendId
                               AND period = 'short_term')
    AND sub1.artist_id IS NULL
    AND sa.artist_id IS NOT NULL

  ORDER BY EXP(-0.02 * position + 0.25 * (IF(category_id IN (2, 3, 7), 1, 0)) +
               0.35 * (IF(ufp.date_inserted >= (date(now()) - INTERVAL 7 day), 1, 0)) -
               0.6) DESC
  LIMIT 5
`;

export const DISCOVER_FRIEND_CATEGORIES = `
  SELECT sub1.genre_id    as genreId,
         sub1.genre_name  as genreName,
         sub1.category_id as categoryId,
         sub1.category,
         sub1.p1
  FROM (SELECT ag.genre_id,
               g.genre_name,
               ac.category_id,
               c.category,
               ROUND(COUNT(*) / (SELECT COUNT(*)
                                 FROM labl.user_feed_preferences ufp2
                                        JOIN ean_collection.artist_genre ag2
                                             ON ag2.artist_id = ufp2.artist_id
                                        JOIN ean_collection.artist_category ac2
                                             ON ac2.artist_id = ufp2.artist_id
                                               AND ac2.run = (SELECT MAX(run)
                                                              FROM ean_collection.artist_category ac3
                                                              WHERE ac3.artist_id = ufp2.artist_id)
                                 WHERE ufp2.user_id = :friendId), 2) as p1
        FROM labl.user_feed_preferences ufp
               JOIN ean_collection.artist_genre ag ON ag.artist_id = ufp.artist_id
               JOIN ean_collection.genre g ON g.genre_id = ag.genre_id
               JOIN ean_collection.artist_category ac
                    ON ac.artist_id = ufp.artist_id
                      AND ac.run = (SELECT MAX(run)
                                    FROM ean_collection.artist_category)
               JOIN ean_collection.categories c ON c.id = ac.category_id
        WHERE ufp.user_id = :friendId
        GROUP BY ag.genre_id, ac.category_id) sub1
         LEFT JOIN (SELECT ag.genre_id,
                           ac.category_id,
                           ROUND(COUNT(*) / (SELECT COUNT(*)
                                             FROM labl.user_feed_preferences ufp2
                                                    JOIN ean_collection.artist_genre ag2
                                                         ON ag2.artist_id = ufp2.artist_id
                                                    JOIN ean_collection.artist_category ac2
                                                         ON ac2.artist_id = ufp2.artist_id
                                                           AND ac2.run = (SELECT MAX(run)
                                                                          FROM ean_collection.artist_category ac3
                                                                          WHERE ac3.artist_id = ufp2.artist_id)
                                             WHERE ufp2.user_id = :userId), 2) as p2
                    FROM labl.user_feed_preferences ufp
                           JOIN ean_collection.artist_genre ag ON ag.artist_id = ufp.artist_id
                           JOIN ean_collection.artist_category ac
                                ON ac.artist_id = ufp.artist_id
                                  AND ac.run = (SELECT MAX(run)
                                                FROM ean_collection.artist_category)
                    WHERE ufp.user_id = :userId
                    GROUP BY ag.genre_id, ac.category_id) sub2
                   ON sub2.genre_id = sub1.genre_id AND sub2.category_id = sub1.category_id
  WHERE sub2.p2 IS NULL
  ORDER BY sub1.p1 DESC
  LIMIT 3
`;

export const DISCOVER_FRIEND_TRACKS = `
  SELECT st.id,
         ust.position as \`rank\`,
         st.track_name trackName,
         st.track_key  trackKey

  FROM labl.\`user_spotify_track_full\` ust
         JOIN ean_collection.spotify_track st ON ust.spotify_track_id = st.id
         LEFT JOIN (SELECT st.id
                    FROM labl.\`user_spotify_track_full\` ust
                           JOIN ean_collection.spotify_track st ON ust.spotify_track_id = st.id
                    WHERE user_id = :userId
                      AND period = 'medium_term'
                      AND ust.date_inserted = (SELECT max(date_inserted)
                                               FROM labl.\`user_spotify_track_full\`
                                               WHERE user_id = :userId
                                                 AND period = 'medium_term')) sub1 ON sub1.id = st.id

  WHERE ust.user_id = :friendId
    AND period = 'medium_term'
    AND ust.date_inserted = (SELECT max(date_inserted)
                             FROM labl.\`user_spotify_track_full\`
                             WHERE user_id = :friendId
                               AND period = 'medium_term')
    AND sub1.id IS NULL

  GROUP BY st.track_key
  ORDER BY ust.position
  LIMIT 5
`;

export const DISCOVER_FRIEND_ARTISTS = `
  SELECT sa.artist_id   artistId,
         sa.artist_name artistName

  FROM labl.\`user_spotify_artist_full\` usa
         JOIN ean_collection.spotify_artist sa ON usa.spotify_artist_id = sa.id
         LEFT JOIN (SELECT sa.artist_id
                    FROM labl.\`user_spotify_artist_full\` usa
                           JOIN ean_collection.spotify_artist sa ON usa.spotify_artist_id = sa.id
                    WHERE user_id = :userId
                      AND period = 'medium_term'
                      AND usa.date_inserted = (SELECT max(date_inserted)
                                               FROM labl.\`user_spotify_artist_full\`
                                               WHERE user_id = :userId
                                                 AND period = 'medium_term')) sub1
                   ON sub1.artist_id = sa.artist_id
         LEFT JOIN ean_collection.artist_category ac ON ac.artist_id = sa.artist_id AND ac.run =
                                                                                        (SELECT max(run) FROM ean_collection.artist_category)
         LEFT JOIN labl.user_feed_preferences ufp ON sa.artist_id = ufp.artist_id AND ufp.user_id = usa.user_id

  WHERE usa.user_id = :friendId
    AND period = 'medium_term'
    AND usa.date_inserted = (SELECT max(date_inserted)
                             FROM labl.\`user_spotify_artist_full\`
                             WHERE user_id = :friendId
                               AND period = 'medium_term')
    AND sub1.artist_id IS NULL
    AND sa.artist_id IS NOT NULL

  ORDER BY usa.position ASC
  LIMIT 5
`;

export const COMPARE_BADGES = `
  SELECT badge_id badgeId,
         badge,
         (CASE
            WHEN count(user_id) = 2 THEN 'shared'
            WHEN user_id = :userId THEN 'user'
            WHEN user_id = :friendId THEN 'friend'
           END)   section
  FROM labl.\`user_badges\` ub
         JOIN labl.badges b
              ON ub.badge_id = b.id
  WHERE user_id IN (:userId, :friendId)
  GROUP BY badge_id
  ORDER BY \`section\`
`;

export const COMPARE_FRIEND_GENRES = `
  SELECT sub1.genre_id                as genreId,
         sub1.genre_name              as genreName,
         COALESCE(sub1.userRank, 0)   as userRank,
         COALESCE(sub2.friendRank, 0) as friendRank
  FROM (SELECT ag.genre_id,
               g.genre_name,
               ROUND(COUNT(*) / (SELECT COUNT(*)
                                 FROM labl.user_feed_preferences ufp2
                                        JOIN ean_collection.artist_genre ag2
                                             ON ag2.artist_id = ufp2.artist_id
                                 WHERE ufp2.user_id = :userId), 2) as userRank
        FROM labl.user_feed_preferences ufp
               JOIN ean_collection.artist_genre ag ON ag.artist_id = ufp.artist_id
               JOIN ean_collection.genre g ON g.genre_id = ag.genre_id
        WHERE ufp.user_id = :userId
        GROUP BY ag.genre_id) sub1
         LEFT JOIN (SELECT ag.genre_id,
                           ROUND(COUNT(*) / (SELECT COUNT(*)
                                             FROM labl.user_feed_preferences ufp2
                                                    JOIN ean_collection.artist_genre ag2
                                                         ON ag2.artist_id = ufp2.artist_id
                                             WHERE ufp2.user_id = :friendId), 2) as friendRank
                    FROM labl.user_feed_preferences ufp
                           JOIN ean_collection.artist_genre ag ON ag.artist_id = ufp.artist_id
                           JOIN ean_collection.genre g ON g.genre_id = ag.genre_id
                    WHERE ufp.user_id = :friendId
                    GROUP BY ag.genre_id) sub2 ON sub2.genre_id = sub1.genre_id
  ORDER BY POWER(POWER(userRank, 2) + POWER(friendRank, 2), 0.5) DESC
  LIMIT :take
`;

export const COMPARE_SHARED_ARTISTS = `
  SELECT sub1.artist_id   artistId,
         sub1.artist_name artistName,
         sub1.rank        userRank,
         sub2.rank        friendRank
  FROM (SELECT sa.artist_id,
               sa.artist_name,
               usa.position as \`rank\`

        FROM labl.\`user_spotify_artist_full\` usa
               JOIN ean_collection.spotify_artist sa ON usa.spotify_artist_id = sa.id

        WHERE user_id = :userId
          AND period = 'medium_term'
          AND usa.date_inserted = (SELECT max(date_inserted)
                                   FROM labl.\`user_spotify_artist_full\`
                                   WHERE user_id = :userId
                                     AND period = 'medium_term')) sub1
         JOIN (SELECT sa.artist_id,
                      sa.artist_name,
                      usa.position as \`rank\`

               FROM labl.\`user_spotify_artist_full\` usa
                      JOIN ean_collection.spotify_artist sa ON usa.spotify_artist_id = sa.id

               WHERE user_id = :friendId
                 AND period = 'medium_term'
                 AND usa.date_inserted = (SELECT max(date_inserted)
                                          FROM labl.\`user_spotify_artist_full\`
                                          WHERE user_id = :friendId
                                            AND period = 'medium_term')) sub2 ON sub1.artist_id = sub2.artist_id

  ORDER BY power(power(COALESCE(sub1.rank, 0), 2) + power(COALESCE(sub2.rank, 0), 2), 0.5)
  LIMIT :take
`;

export const COMPARE_SHARED_TRACKS = `
  SELECT sub1.id,
         sub1.track_key   trackKey,
         sub1.track_name  trackName,
         sub1.album_image albumImage,
         sub1.artists,
         sub1.rank        userRank,
         sub2.rank        friendRank
  FROM (SELECT st.id,
               st.track_key,
               st.track_name,
               sa.album_image,
               stf.position as \`rank\`,
               GROUP_CONCAT(DISTINCT (sar.artist_name) SEPARATOR ', ') artists
        FROM labl.\`user_spotify_track_full\` stf
               JOIN ean_collection.spotify_track st ON stf.spotify_track_id = st.id
               JOIN ean_collection.spotify_album_track sat ON st.id = sat.spotify_track_id
               JOIN ean_collection.spotify_album sa ON sa.id = sat.spotify_album_id
               JOIN ean_collection.spotify_artist sar ON sat.spotify_artist_id = sar.id
        WHERE user_id = :userId
          AND period = 'medium_term'
          AND stf.date_inserted = (SELECT max(date_inserted)
                                   FROM labl.\`user_spotify_track_full\`
                                   WHERE user_id = :userId
                                     AND period = 'medium_term')
        GROUP BY stf.position) sub1
         JOIN (SELECT st.id,
                      st.track_key,
                      st.track_name,
                      sa.album_image,
                      stf.position as \`rank\`
               FROM labl.\`user_spotify_track_full\` stf
                      JOIN ean_collection.spotify_track st ON stf.spotify_track_id = st.id
                      JOIN ean_collection.spotify_album_track sat ON st.id = sat.spotify_track_id
                      JOIN ean_collection.spotify_album sa ON sa.id = sat.spotify_album_id
               WHERE user_id = :friendId
                 AND period = 'medium_term'
                 AND stf.date_inserted = (SELECT max(date_inserted)
                                          FROM labl.\`user_spotify_track_full\`
                                          WHERE user_id = :friendId
                                            AND period = 'medium_term')
               GROUP BY stf.position) sub2 ON sub1.id = sub2.id
  ORDER BY power(power(COALESCE(sub1.rank, 0), 2) + power(COALESCE(sub2.rank, 0), 2), 0.5)
  LIMIT :take
`;

export const GET_USER_TOP_RECENT_TRACKS = `
  SELECT st.id,
         stf.position as \`rank\`
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
  LIMIT :take OFFSET :skip
`;

export const GET_USER_MOST_LISTENED_ARTISTS = `
  SELECT a.id as artistId,
         usa.position as \`rank\`
  FROM (SELECT user_id, period, position as \`rank\`, MAX(last_checked) as lastChecked
        FROM \`labl\`.\`user_spotify_artist_full\` usa
        WHERE user_id = :userId
          AND period = 'medium_term'
        GROUP BY position) lc
         JOIN \`labl\`.\`user_spotify_artist_full\` usa
              ON lc.rank = usa.position
                AND lc.lastChecked = usa.last_checked
                AND usa.user_id = lc.user_id
                AND usa.period = lc.period
         JOIN \`ean_collection\`.\`spotify_artist\` sa
              ON sa.id = usa.spotify_artist_id
         JOIN \`ean_collection\`.\`artist\` a
              ON a.id = sa.artist_id
                AND a.is_active = 1
  ORDER BY usa.position
  LIMIT :take OFFSET :skip
`;

export const GET_USER_TOP_CATEGORIES = `
  SELECT category,
         genre_name
  FROM \`labl\`.\`v_feed_genre_category\`
  WHERE user_id = :userId
    AND genre_name IS NOT NULL
    AND category IS NOT NULL
  GROUP BY genre_name, category
  ORDER BY COUNT(user_id) DESC
  LIMIT 3
`;

export const GET_USER_GENRES = `
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
  LIMIT 4
`;
