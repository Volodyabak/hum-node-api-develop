module.exports = {
  FILTER_NOT_COMPLETED_BRACKHITS: `
    SELECT bb.*
    FROM (SELECT brackhit_id                                                                 as brackhitId,
                 name,
                 thumbnail,
                 :userTime BETWEEN time_live AND DATE_ADD(time_live, INTERVAL duration HOUR) as isLive
          FROM labl.brackhit
          WHERE brackhit_id IN :brackhitIds) bb
           LEFT JOIN labl.brackhit_user bu
                     ON bu.brackhit_id = bb.brackhitId AND bu.user_id = :userId
    WHERE (bu.is_complete IS NULL
      OR bu.is_complete = 0)
    ORDER BY bb.brackhitId DESC
    LIMIT :take;
  `,
};
