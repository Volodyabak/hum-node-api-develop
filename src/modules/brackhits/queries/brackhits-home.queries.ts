export const GET_FOR_YOU_BRACKHITS_BY_SPOTIFY_RANK = `
  SELECT b.*,
         sub.is_complete,
         sub.rank,
         sub.artist_id
  FROM (SELECT sub.brackhit_id,
               sub.is_complete,
               sub.artist_id,
               count(sub2.rank)                                   as appearances,
               count(sub2.rank) * sum(COALESCE(1 / sub2.rank, 0)) as \`rank\`
        FROM (SELECT bm.brackhit_id,
                     bm.seed,
                     sa.artist_id,
                     sa.id,
                     sa.artist_name,
                     bu.is_complete
              FROM labl.brackhit_matchups bm
                     JOIN labl.brackhit_content bc ON bm.choice_id = bc.choice_id
                     JOIN ean_collection.spotify_track st ON st.id = bc.content_id
                     JOIN ean_collection.spotify_album_track sat ON st.id = sat.spotify_track_id
                     JOIN ean_collection.spotify_artist sa ON sat.spotify_artist_id = sa.id
                     LEFT JOIN labl.brackhit_user bu ON bu.brackhit_id = bm.brackhit_id AND bu.user_id = :userId
              WHERE content_type_id = 1
                AND COALESCE(bu.is_complete, 0) = 0
              GROUP BY bm.brackhit_id, bm.seed) sub
               LEFT JOIN (SELECT spotify_artist_id, position as \`rank\`
                          FROM labl.user_spotify_artist_full
                          WHERE user_id = :userId
                            AND period = 'medium_term'
                            AND date_inserted = (SELECT max(date_inserted)
                                                 FROM labl.user_spotify_artist_full
                                                 WHERE user_id = :userId
                                                   AND period = 'medium_term')) sub2
                         ON sub2.spotify_artist_id = sub.id
        GROUP BY sub.brackhit_id
        HAVING \`rank\` >= 1) sub
         LEFT JOIN labl.brackhit_artists ba ON sub.brackhit_id = ba.brackhit_id
         JOIN labl.brackhit b ON sub.brackhit_id = b.brackhit_id

  GROUP BY COALESCE(ba.artist_id, -rand())
  HAVING \`rank\` >= 8
`;

export const GET_FOR_YOU_BRACKHITS_BY_USER_CHOICE = `
  SELECT sub.*,
         count(sub2.rank)                                   as appearances,
         count(sub2.rank) * sum(COALESCE(1 / sub2.rank, 0)) as \`rank\`
  FROM (SELECT b.*,
               sa.artist_id,
               sa.id,
               artist_name,
               bu.is_complete
        FROM labl.brackhit_matchups bm
               JOIN labl.brackhit b ON bm.brackhit_id = b.brackhit_id
               JOIN labl.brackhit_content bc ON bm.choice_id = bc.choice_id
               JOIN ean_collection.spotify_track st ON st.id = bc.content_id
               JOIN ean_collection.spotify_album_track sat ON st.id = sat.spotify_track_id
               JOIN ean_collection.spotify_artist sa ON sat.spotify_artist_id = sa.id
               LEFT JOIN labl.brackhit_user bu ON bu.brackhit_id = b.brackhit_id AND bu.user_id = :userId
        WHERE content_type_id = 1
          AND COALESCE(bu.is_complete, 0) = 0
        GROUP BY bm.brackhit_id, bm.seed) sub
         LEFT JOIN (SELECT *, @curRank := @curRank + 1 as \`rank\`
                    FROM (SELECT artist_id,
                                 artist_name,
                                 count(artist_id) n
                          FROM (SELECT buc.brackhit_id,
                                       sa.artist_id,
                                       sa.artist_name
                                FROM labl.brackhit_user_choices buc
                                       JOIN labl.brackhit_content bc ON buc.choice_id = bc.choice_id
                                       JOIN ean_collection.spotify_track st ON st.id = bc.content_id
                                       JOIN ean_collection.spotify_album_track sat ON st.id = sat.spotify_track_id
                                       JOIN ean_collection.spotify_artist sa ON sat.spotify_artist_id = sa.id
                                WHERE buc.user_id = :userId
                                  AND content_type_id = 1
                                GROUP BY brackhit_id, round_id) sub
                          GROUP BY artist_id
                          ORDER BY count(artist_id) DESC) sub2,
                         (SELECT @curRank := 0) r) sub2 ON sub2.artist_id = sub.artist_id
  GROUP BY brackhit_id
  HAVING \`rank\` >= 1
`;
