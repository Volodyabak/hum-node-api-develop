module.exports = {
  GET_BRACKHIT_CHOICES: `
    SELECT bm.brackhit_id brackhitId,
           bm.seed,
           bm.round_id    roundId,
           bm.choice_id   choiceId,
           bt.type,
           bc.content_id  contentId
    FROM labl.brackhit_matchups bm
           JOIN labl.brackhit_content bc ON bm.choice_id = bc.choice_id
           JOIN labl.brackhit_type bt ON bc.content_type_id = bt.type_id
    WHERE bm.brackhit_id = :brackhitId;
  `,

  GET_BRACKHIT_CHOICES_WITH_VOTES: `
    SELECT bm.brackhit_id                brackhitId,
           bm.seed,
           bm.round_id                   roundId,
           bm.choice_id                  choiceId,
           bt.type,
           bc.content_id                 contentId,
           (SELECT COUNT(*)
            FROM labl.brackhit_user_choices buc
                   JOIN labl.brackhit_user bu
                        ON bu.brackhit_id = buc.brackhit_id
                          AND bu.user_id = buc.user_id
            WHERE buc.brackhit_id = bm.brackhit_id
              AND buc.round_id = bm.round_id
              AND buc.choice_id = bm.choice_id
              AND bu.is_complete = 1) as votes
    FROM labl.brackhit_matchups bm
           JOIN labl.brackhit_content bc ON bm.choice_id = bc.choice_id
           JOIN labl.brackhit_type bt ON bc.content_type_id = bt.type_id
    WHERE bm.brackhit_id = :brackhitId;
  `,

  GET_BRACKHIT_LEADERBOARD: `
    SELECT bus.user_id as userId,
           brackhit_id as brackhitId,
           score,
           first_name  as firstName,
           last_name   as lastName,
           user_image  as userImage,
           ui.type_id  as influencerType,
           bb.id       as bin,
           bb.text     as binText,
           username,
           sim.similarity
    FROM labl.brackhit_user_score bus
           JOIN labl.user_profile_info upi ON bus.user_id = upi.user_id
           LEFT JOIN labl.user_influencer ui ON ui.user_id = upi.user_id
           JOIN labl.brackhit_bins bb ON bb.id = bus.bin
           JOIN (SELECT sub.user_id,
                        ROUND(SUM(points) / (8 * 3 + 4), 2) as similarity
                 FROM (SELECT buc1.user_id,
                              buc1.round_id,
                              (CASE
                                 WHEN buc1.round_id <= 8 THEN 1
                                 WHEN buc1.round_id <= 12 THEN 2
                                 WHEN buc1.round_id <= 14 THEN 4
                                 WHEN buc1.round_id <= 15 THEN 4
                                END) * (buc1.choice_id = buc2.choice_id) as points
                       FROM labl.brackhit_user_choices buc1
                              JOIN labl.brackhit_user_choices buc2
                                   ON buc2.brackhit_id = buc1.brackhit_id
                                     AND buc2.round_id = buc1.round_id
                                     AND buc2.user_id = :tokenUserId
                       WHERE buc1.brackhit_id = :brackhitId) as sub
                 GROUP BY sub.user_id) sim ON sim.user_id = bus.user_id
    WHERE brackhit_id = :brackhitId
    ORDER BY sim.similarity DESC
    LIMIT :take OFFSET :skip;
  `,

  GET_BRACKHIT_LEADERBOARD_OWNER: `
    SELECT bus.user_id     as userId,
           bus.brackhit_id as brackhitId,
           score,
           first_name      as firstName,
           last_name       as lastName,
           user_image      as userImage,
           bb.id           as bin,
           bb.text         as binText,
           username,
           sim.similarity
    FROM labl.brackhit_user_score bus
           JOIN labl.user_profile_info upi ON bus.user_id = upi.user_id
           JOIN labl.brackhit_bins bb ON bb.id = bus.bin
           JOIN (SELECT sub.user_id,
                        ROUND(SUM(points) / (8 * 3 + 4), 2) as similarity
                 FROM (SELECT buc1.user_id,
                              buc1.round_id,
                              (CASE
                                 WHEN buc1.round_id <= 8 THEN 1
                                 WHEN buc1.round_id <= 12 THEN 2
                                 WHEN buc1.round_id <= 14 THEN 4
                                 WHEN buc1.round_id <= 15 THEN 4
                                END) * (buc1.choice_id = buc2.choice_id) as points
                       FROM labl.brackhit_user_choices buc1
                              JOIN labl.brackhit_user_choices buc2
                                   ON buc2.brackhit_id = buc1.brackhit_id
                                     AND buc2.round_id = buc1.round_id
                                     AND buc2.user_id = :tokenUserId
                       WHERE buc1.brackhit_id = :brackhitId) as sub
                 GROUP BY sub.user_id) sim ON sim.user_id = bus.user_id
    WHERE bus.brackhit_id = :brackhitId
      AND bus.user_id = :ownerId;
  `,

  GET_INSTANT_BRACKHIT_BY_ID: `
    SELECT brackhit_id as brackhitId
    FROM labl.brackhit
    WHERE brackhit_id = :brackhitId
      AND DATE_ADD(time_live, INTERVAL duration HOUR) <= :date;
  `,

  GET_ARTIST_BRACKHITS_CONTAINING_ARTISTS: `
    SELECT b.brackhit_id as brackhitId
    FROM (SELECT brackhit_id
          FROM labl.brackhit
          WHERE type_id = 2
            AND time_live <= :userTime) b
           JOIN labl.brackhit_matchups bm ON bm.brackhit_id = b.brackhit_id
           LEFT JOIN labl.brackhit_content bc ON bc.choice_id = bm.choice_id
    WHERE bc.content_id IN :artistIds
    GROUP BY b.brackhit_id;
  `,

  GET_TRACK_BRACKHITS_CONTAINING_ARTISTS: `
    SELECT DISTINCT b.brackhit_id as brackhitId
    FROM (SELECT brackhit_id
          FROM labl.brackhit
          WHERE (type_id = 1 OR type_id = 3)
            AND time_live <= :userTime) b
           JOIN labl.brackhit_matchups bm ON bm.brackhit_id = b.brackhit_id
           JOIN labl.brackhit_content bc ON bc.choice_id = bm.choice_id
           JOIN ean_collection.spotify_album_track sat ON sat.spotify_track_id = bc.content_id
           JOIN ean_collection.spotify_artist sa ON sa.id = sat.spotify_artist_id
    WHERE sa.artist_id IN :artistIds
    GROUP BY b.brackhit_id, sa.artist_id
    HAVING COUNT(*) >= :contentCount;
  `,

  GET_BRACKHIT_WITH_ONE_ARTIST: `
    SELECT brackhit_id as brackhitId
    FROM labl.brackhit_tag bt
    WHERE bt.brackhit_id = :brackhitId
      AND bt.tag_id = 9
    GROUP BY bt.brackhit_id;
  `,

  GET_BRACKHITS_HOT_TAKES: `
    SELECT sub.*,
           upi.username,
           upi.user_image as userImage
    FROM (SELECT sub.brackhit_id as brackhitId,
                 sub.name        as brackhitName,
                 br.round_id     as roundId,
                 br.choice_id    as firstChoiceId,
                 bm.choice_id    as secondChoiceId,
                 (SELECT buc.user_id
                  FROM labl.brackhit_user_choices buc
                         JOIN labl.brackhit_user bu
                              ON bu.brackhit_id = buc.brackhit_id AND bu.user_id = buc.user_id
                  WHERE buc.brackhit_id = br.brackhit_id
                    AND buc.round_id = br.round_id
                    AND buc.choice_id = br.choice_id
                    AND bu.is_complete = 1
                  ORDER BY RAND()
                  LIMIT 1)       as userId
          FROM labl.brackhit_results br
                 JOIN (SELECT b.brackhit_id,
                              b.name,
                              SUM(bu.is_complete) as completions
                       FROM labl.brackhit_user bu
                              JOIN labl.brackhit b ON b.brackhit_id = bu.brackhit_id
                       GROUP BY bu.brackhit_id
                       HAVING completions > :minCompletions) sub
                      ON sub.brackhit_id = br.brackhit_id
                 JOIN labl.brackhit_matchups bm
                      ON bm.brackhit_id = sub.brackhit_id AND bm.round_id = br.round_id AND bm.choice_id != br.choice_id
          WHERE br.votes / completions <= :voteShare
          ORDER BY RAND()
          LIMIT :take) sub
           JOIN labl.user_profile_info upi
                ON upi.user_id = sub.userId;
  `,
};
