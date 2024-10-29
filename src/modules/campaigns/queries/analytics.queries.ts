export const GET_VISITORS_AND_SUBMISSIONS_BY_DATE = `
    SELECT sub.campaign_id,
           sub.submission_date,
           sub.submissions,
           cdu.unique_visitors

    FROM (SELECT cul.campaign_id,
                 date(convert_tz(cul.created_at, 'UTC', 'US/Eastern')) submission_date,
                 COUNT(user_id)                                        submissions
          FROM labl.campaign_user_link cul
                   JOIN labl.campaign c ON cul.campaign_id = c.id
          WHERE campaign_id = :campaignId
            AND cul.created_at >= c.campaign_starttime
            AND cul.created_at <= c.campaign_endtime

          GROUP BY submission_date) sub
             LEFT JOIN labl.campaign_daily_users cdu
                       ON sub.campaign_id = cdu.campaign_id AND sub.submission_date = cdu.date
    ORDER BY sub.submission_date ASC
`;

export const GET_TRAFFIC_SOURCE = `
    SELECT cs.name,
           COUNT(cus.id) users,
           round(COUNT(cus.id) / (SELECT COUNT(id) total FROM labl.campaign_user_slug WHERE campaign_id = :campaignId),
                 2)      percentage

    FROM labl.campaign_user_slug cus
             LEFT JOIN labl.campaign_slug cs ON cus.slug_id = cs.id
    WHERE cus.campaign_id = :campaignId

    GROUP BY cs.name
    ORDER BY users DESC
`;

export const GET_USERS_BY_REGIONS = `
    SELECT cua.region, COUNT(*) as count
    FROM labl.campaign_user_trivia game
             LEFT JOIN labl.campaign_user_agents cua ON game.campaign_user_id = cua.campaign_user_id
    WHERE game.campaign_id = :campaignId
      and cua.region IS NOT NULL
    GROUP BY cua.region
    ORDER BY count DESC
    LIMIT 4;
`;

export const GET_BRACKHIT_TOP_ANSWERS = `
    SELECT cb.brackhit_id as brackhitId,
           round_id       as roundId,
           buc.choice_id  as choiceId,
           bc.content_id  as contentId,
           count(cub.id)  as timesChosen
    FROM labl.campaign_user_brackhit cub
             JOIN labl.campaign_brackhit cb ON cb.id = cub.campaign_brackhit_id
             JOIN labl.campaign_brackhit_user_choice buc ON buc.campaign_user_brackhit_id = cub.id
             JOIN labl.brackhit_content bc ON bc.choice_id = buc.choice_id
    WHERE cub.campaign_id = :campaignId

    GROUP BY buc.round_id, buc.choice_id
    ORDER BY buc.round_id ASC, timesChosen DESC;
`;

export const GET_BALLOT_TOP_ANSWERS = `
    SELECT cb.ballot_id                      as ballotId,
           cbuc.round_id                     as roundId,
           cbuc.choice_id                    as choiceId,
           sum(bc.category_size - vote_rank) as bordaCount,
           avg(vote_rank)                       avgVoteRank,
           count(cbuc.id)                       votes

    FROM labl.campaign_user_ballot cub
             JOIN labl.campaign_ballot_user_choice cbuc ON cub.id = cbuc.campaign_user_ballot_id
             JOIN labl.campaign_ballot cb ON cub.campaign_id = cb.campaign_id
             JOIN labl.ballot_categories bc ON cb.ballot_id = bc.ballot_id AND bc.round_id = cbuc.round_id
    WHERE cub.campaign_id = :campaignId

    GROUP BY cbuc.round_id, cbuc.choice_id
    ORDER BY cbuc.round_id ASC, bordaCount DESC;
`;

export const GET_TRIVIA_TOP_ANSWERS = `
    SELECT ct.trivia_id  as triviaId,
           tuc.round_id  as roundId,
           tuc.choice_id as choiceId,
           COUNT(cut.id) as timesChosen
    FROM labl.campaign_user_trivia cut
             JOIN labl.campaign_trivia_user_choice tuc ON cut.id = tuc.campaign_user_trivia_id
             JOIN labl.campaign_trivia ct ON cut.campaign_id = ct.campaign_id
    WHERE cut.campaign_id = :campaignId

    GROUP BY tuc.round_id, tuc.choice_id

    ORDER BY tuc.round_id ASC, timesChosen DESC;
`;
