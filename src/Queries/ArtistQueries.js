module.exports = {
  GET_ALL_ARTISTS: `
    SELECT DISTINCT a.id                                                                      as artistId,
                    ds.daily_points                                                           as buzzPoints,
                    ds.direction                                                              as rankChange,
                    a.facebook_name                                                           as artistName,
                    IF(a.image_file IS NULL, 'https://emergingartistnetwork.com/images/no_profile.png',
                       IF(SUBSTRING(a.image_file, 1, 4) = 'http', a.image_file,
                          CONCAT('https://emergingartistnetwork.com/images/', a.image_file))) as artistPhoto,
                    FALSE                                                                     as newBlurbs,
                    IFNULL(g.genre_id, '')                                                    as genreName,
                    COALESCE(a.spotify_artistkey, sa.artist_key)                              as spotifyId,
                    c.category                                                                as category
    FROM ean_collection.artist a
           LEFT JOIN ean_collection.spotify_artist sa ON sa.artist_id = a.id
           LEFT JOIN ean_collection.artist_genre ag ON ag.artist_id = a.id
           LEFT JOIN ean_collection.genre g ON ag.genre_id = g.genre_id
           LEFT JOIN labl.daily_scores ds
                     ON (ds.date = (SELECT MAX(\`date\`)
                                    FROM \`labl\`.daily_scores)
                       AND ds.artist_id = a.id)
           LEFT JOIN ean_collection.artist_category ac
                     ON ac.artist_id = a.id
                       AND ac.run = (SELECT MAX(run)
                                     FROM ean_collection.artist_category
                                     WHERE artist_id = a.id)
           LEFT JOIN ean_collection.categories c ON ac.category_id = c.id
    ORDER BY buzzPoints DESC, 3 DESC
    LIMIT :take OFFSET :skip
  `,

  GET_ARTISTS_COUNT: `
    SELECT COUNT(id) count
    FROM ean_collection.artist
  `,

  GET_ARTIST_YOUTUBE_VIDEOS: `
      SELECT yav.artist_id,
             cf.id                                                 AS centralId,
             CONCAT('http://youtube.com/watch?v=', yv.youtube_key) AS videoUrl,
             yv.video_title                                        AS videoTitle,
             yv.video_created                                      AS videoCreateDate

      FROM ean_collection.youtube_video yv
               JOIN ean_collection.youtube_artist_video yav ON yv.id = yav.youtube_video_id
               JOIN ean_collection.central_feed cf ON yv.id = cf.source_id

      WHERE yav.artist_id = :artistId
        AND cf.feed_source = 2
        AND yv.channel_id IS NULL
        AND yv.playlist_id IS NULL

      ORDER BY yv.video_created DESC
      LIMIT :take OFFSET :skip
  `,

  GET_ARTIST_CHANNEL: `
    SELECT subscribers          as youtubeSubscribers
         , videos
         , views
         , bannerMobileImageUrl as youtubeBanner
         , defaultThumbnail     as youtubeAvatar
         , ay.artist_id         as artistId
    FROM \`ean_collection\`.artist_youtube ay
           JOIN (SELECT max(status_date) as status_date, artist_id
                 FROM \`ean_collection\`.artist_youtube
                 WHERE artist_id = :artistId) as yt
                ON (yt.artist_id = ay.artist_id and yt.status_date = ay.status_date)
           JOIN \`ean_collection\`.artist_platform_id api
                ON api.platform_id = 7 AND api.artist_id = yt.artist_id
           JOIN \`ean_collection\`.youtube_channel_images yci
                ON api.platform_user_id = yci.channel_id
  `,

  GET_ARTIST_TWEETS: `
    SELECT text,
           CAST(post_key as CHAR)                                                           as post_key, /* cast to string to avoid precision loss */
           retweet_count,
           favorite_count,
           post_created                                                                     as timeStamp,
           atp.username                                                                     as artistHandle,
           atp.profile_image                                                                as profileImage,
           a.id                                                                             as artistId,
           a.facebook_name                                                                  as artistName,
           CONCAT('https://twitter.com/', atp.username, '/status/', CAST(post_key as CHAR)) as tweetLink,
           (SELECT JSON_ARRAYAGG(JSON_OBJECT(
             'mediaType', tm.media_type_id
             , 'mediaSource', tm.media
             , 'postId', tm.post_id
             ))
            FROM \`ean_collection\`.\`twitter_media\` tm
            WHERE tm.post_id = tp.post_id)                                                  as tweetMedia,
      /* NOTE: sub-query to get data for the tweet that was replied to */
           (SELECT JSON_OBJECT(
                     'text', tr.text,
                     'artistHandle', tr.username,
                     'artistName', tr.userhandle,
                     'retweet_count', tr.retweet_count,
                     'favorite_count', tr.favorite_count,
                     'timeStamp', tr.post_created,
                     'replyMedia', (SELECT JSON_ARRAYAGG(JSON_OBJECT(
               /* NOTE: sub-sub-query to get any media for reply */
               'mediaType', trm.media_type_id
               , 'mediaSource', trm.media
               , 'replyToId', trm.reply_to_id
               ))
                                    FROM \`ean_collection\`.\`twitter_replies_media\` trm
                                    WHERE trm.reply_to_id = tr.reply_to_id))
            FROM \`ean_collection\`.\`twitter_replies\` tr
            WHERE tr.reply_to_id = tp.reply_to_id)                                          as replyData
    FROM \`ean_collection\`.twitter_post tp
           LEFT JOIN \`ean_collection\`.twitter_artist_post tap
                     ON tp.post_id = tap.post_id
           LEFT JOIN \`ean_collection\`.artist_twitter_profile atp
                     ON atp.artist_id = tap.artist_id
           JOIN \`ean_collection\`.artist a
                ON a.id = :artist_id AND a.id = atp.artist_id
    WHERE tp.post_created > DATE_ADD(NOW(), INTERVAL -14 DAY)
    ORDER by tp.post_created
  `,

  //v2: see if we can write this without using DISTINCT
  GET_ARTIST_NEWS: `
    SELECT DISTINCT a.image_file,
                    a.facebook_name               as artist_name,
                    nfi.id                        as id,
                    news_feed_id,
                    title,
                    link,
                    feed_timestamp                as timeStamp,
                    detail                        as description,
                    coalesce(image, nf.feed_icon) as image
    FROM \`ean_collection\`.artist_news_item ani
           JOIN \`ean_collection\`.news_feed_item nfi
                on ani.news_feed_item_id = nfi.id
           JOIN \`ean_collection\`.artist a on a.id = :artistId AND a.id = ani.artist_id
           JOIN \`ean_collection\`.news_feed nf on nf.id = nfi.news_feed_id
    WHERE nfi.feed_timestamp > DATE_ADD(NOW(), INTERVAL -30 DAY)
    ORDER by feed_timestamp
  `,

  GET_ARTIST_PROFILE: `
    SELECT a.id,
           a.facebook_name           as name,
           a.image_file              as photo,
           a.spotify_artistkey       as spotifyId,
           daily_scores.daily_points as buzzPoints,
           daily_scores.direction    as rankChange,
           IFNULL(g.genre_name, '')  as genreName,
           category.category         as category
    FROM ean_collection.artist a
           LEFT JOIN labl.daily_scores daily_scores
                     ON (daily_scores.date = (SELECT MAX(date)
                                              FROM labl.daily_scores
                                              WHERE artist_id = a.id)
                       AND daily_scores.artist_id = a.id)
           LEFT JOIN ean_collection.artist_genre ag ON ag.artist_id = a.id
           LEFT JOIN ean_collection.genre g ON g.genre_id = ag.genre_id
           LEFT JOIN (SELECT c.category,
                             ac.artist_id
                      FROM ean_collection.artist_category ac
                             JOIN ean_collection.categories c
                                  ON ac.category_id = c.id
                                    AND ac.run = (SELECT MAX(run)
                                                  FROM \`ean_collection\`.\`artist_category\`
                                                  WHERE artist_id = :artistId)) AS category
                     ON category.artist_id = a.id
    WHERE a.id = :artistId;
  `,

  GET_ARTIST_TRACK_KEY: `
    SELECT track_id as trackId
    FROM labl.brackhit_content_artisttrack
    WHERE brackhit_id = :brackhitId
      AND choice_id = :artistId;
  `,

  INSERT_OR_UPDATE_ARTIST_FROM_SPOTIFY: `
    INSERT INTO ean_collection.artist(facebook_name, spotify_artistkey)
    VALUES (:artistName, :artistKey)
    ON DUPLICATE KEY
      UPDATE facebook_name = :artistName;
  `,

  GET_ARTIST_BY_SPOTIFY_KEY: `
    SELECT id
    FROM ean_collection.artist
    WHERE spotify_artistkey = :artistKey;
  `,

  GET_TOP_ARTISTS_BY_DAILY_SCORE: `
    SELECT a.id
    FROM ean_collection.artist a
           LEFT JOIN labl.daily_scores ds
                     ON a.id = ds.artist_id
                       AND ds.date = (SELECT MAX(date)
                                      FROM labl.daily_scores)
    ORDER BY ds.daily_points DESC
    LIMIT :take;
  `,
};
