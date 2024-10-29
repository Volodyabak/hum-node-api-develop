module.exports = {
  INSERT_OR_UPDATE_USER_ARTIST_FEED_PREFERENCE: `
    INSERT INTO \`labl\`.\`user_feed_preferences\` (artist_id, user_id, video_flag, tweet_flag, news_flag)
    VALUES (:artistId, :userId, :videoFlag, :tweetFlag, :newsFlag)
    ON DUPLICATE KEY
      UPDATE video_flag = :videoFlag,
             tweet_flag = :tweetFlag,
             news_flag  = :newsFlag;
  `,

  REMOVE_USER_FEED_ARTIST: `
    DELETE
    FROM \`labl\`.\`user_feed_preferences\`
    WHERE artist_id = :artistId
      AND user_id = :userId
  `,

  GET_USER_ARTISTS_COUNT: `
    SELECT COUNT(*) as count
    FROM labl.user_feed_preferences
    WHERE user_id = :userId;
  `,
};
