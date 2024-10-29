module.exports = {
  GET_USER_FRIENDS: `
    SELECT user_id   userId,
           friend_id friendId,
           timestamp
    FROM labl.user_friends
    WHERE user_id = :userId
    ORDER BY timestamp DESC
    LIMIT :take OFFSET :skip;
  `,

  GET_USER_FRIENDS_WITH_COMPATABILITY: `
    SELECT uf.user_id   as userId,
           uf.friend_id as friendId,
           uf.timestamp,
           ufc.compatability
    FROM labl.user_friends uf
           LEFT JOIN labl.user_friend_compatability ufc
                     ON ufc.user_id = uf.user_id
                       AND ufc.friend_id = uf.friend_id
    WHERE uf.user_id = :userId
    ORDER BY ufc.compatability DESC
    LIMIT :take OFFSET :skip;
  `,

  GET_INCOMING_FRIEND_REQUESTS: `
    SELECT user_id           as userId,
           user_requested_id as userRequestedId,
           timestamp,
           status
    FROM labl.user_friend_requests
    WHERE user_requested_id = :userId
      AND status = 'pending'
    GROUP BY user_id, user_requested_id;
  `,
};
