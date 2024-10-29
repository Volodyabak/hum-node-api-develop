import { Injectable } from '@nestjs/common';

import {
  BallotModel,
  CampaignBallotModel,
  CampaignUserBallotModel,
  CampaignBallotUserChoice,
} from '@database/Models';
import { db } from '@database/knex';
import {
  joinOrderParamsToQueryBuilder,
  joinPaginationParamsToQueryBuilder,
  joinSearchParamsToQueryBuilder,
  RestfulQuery,
} from '../../../../decorators/restful-query.decorator';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';
import { camelCase, mapKeys } from 'lodash';

@Injectable()
export class BallotsRepository {
  findBallots(restQuery: RestfulQuery) {
    const query = BallotModel.query();
    const totalQuery = BallotModel.query();

    joinSearchParamsToQueryBuilder(query, restQuery);
    joinOrderParamsToQueryBuilder(query, restQuery);
    joinPaginationParamsToQueryBuilder(query, restQuery);

    joinSearchParamsToQueryBuilder(totalQuery, restQuery);

    return [query, totalQuery.resultSize()];
  }

  findBallot(data: Partial<BallotModel>) {
    return BallotModel.query().findOne(data);
  }

  findCampaignBallot(data: Partial<CampaignBallotModel>) {
    return CampaignBallotModel.query().findOne(data);
  }

  insertCampaignUserBallot(data: Partial<CampaignUserBallotModel>) {
    return CampaignUserBallotModel.query().insertAndFetch(data);
  }

  insertCampaignBallotUserChoice(data: Partial<CampaignBallotUserChoice>) {
    return CampaignBallotUserChoice.query().insertAndFetch(data);
  }

  async getBallotVotes(param: {
    campaignId: number;
    ballotId: number;
    roundId: number;
  }): Promise<Array<{ roundId: number; choiceId: number; votes: number }>> {
    const [rows] = await db.raw(
      `
        SELECT cbuc.round_id roundId, cbuc.choice_id choiceId, SUM(cbuc.vote_rank) votes
        FROM labl.campaign_ballot cb
               LEFT JOIN labl.campaign_user_ballot cub ON cb.id = cub.campaign_ballot_id
               LEFT JOIN labl.campaign_ballot_user_choice cbuc ON cub.id = cbuc.campaign_user_ballot_id
        WHERE cb.campaign_id = ?
          AND cb.ballot_id = ?
          AND cbuc.round_id = ?
        GROUP BY cbuc.round_id, cbuc.choice_id
        ORDER BY cbuc.round_id, votes DESC;
      `,
      [param.campaignId, param.ballotId, param.roundId],
    );
    return rows;
  }

  async getBallotRankedVotes(ballotId: number, campaignId: number, roundId: number) {
    const [rows] = await db.raw(
      `
          SELECT cbuc.*, COUNT(*) as votes
          FROM labl.campaign_ballot cb
                   LEFT JOIN labl.campaign_user_ballot cub ON cb.id = cub.campaign_ballot_id
                   LEFT JOIN labl.campaign_ballot_user_choice cbuc ON cub.id = cbuc.campaign_user_ballot_id
          WHERE cb.ballot_id = ?
            AND cb.campaign_id = ?
            AND cbuc.round_id = ?
          GROUP BY cbuc.round_id, cbuc.choice_id, cbuc.vote_rank
          ORDER BY cbuc.round_id, cbuc.vote_rank;
      `,
      [ballotId, campaignId, roundId],
    );
    return rows.map((row) => mapKeys(row, (value, key) => camelCase(key)));
  }

  async getBallotTotalVotes(ballotId: number, campaignId: number) {
    const [rows] = await db.raw(
      `
          SELECT COUNT(*) as votes
          FROM labl.campaign_ballot cb
                   LEFT JOIN labl.campaign_user_ballot cub ON cb.id = cub.campaign_ballot_id
          WHERE cb.ballot_id = ?
            AND cb.campaign_id = ?;
      `,
      [ballotId, campaignId],
    );

    return rows.length === 0 ? 0 : rows[0].votes;
  }
}
