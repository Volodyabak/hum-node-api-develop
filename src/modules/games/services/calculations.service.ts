import { Injectable } from '@nestjs/common';
import { RepositoryService } from '../../repository/services/repository.service';
import { Ballot, BallotRound, BallotRoundVoteType } from '@database/mongodb/games/ballot';

@Injectable()
export class CalculationsService {
  constructor(private readonly repository: RepositoryService) {}
  async calculateBallotResults(ballot: Ballot, campaignId: number) {
    const winnerMap = new Map<number, Map<number, { votes: number }>>();

    await Promise.all(
      ballot.rounds.map(async (round) => {
        if (round.votingType === BallotRoundVoteType.Ranked) {
          await this.calculateBallotRankedVotes(ballot.ballotId, round, campaignId, winnerMap);
        } else if (round.votingType === BallotRoundVoteType.Unranked) {
          await this.calculateBallotUnrankedVotes(ballot.ballotId, round, campaignId, winnerMap);
        }
      }),
    );

    return winnerMap;
  }

  private async calculateBallotUnrankedVotes(
    ballotId: number,
    round: BallotRound,
    campaignId: number,
    winnerMap: Map<number, Map<number, { votes: number }>>,
  ) {
    const votes = await this.repository.ballots.getBallotVotes({
      ballotId,
      campaignId,
      roundId: round.roundId,
    });

    let maxVotes = 0;
    votes.forEach((vote) => {
      if (vote.votes > maxVotes) {
        maxVotes = vote.votes;
      }

      if (vote.votes === maxVotes) {
        const winners = winnerMap.get(round.roundId) || new Map();
        winners.set(vote.choiceId, { votes: vote.votes });
        winnerMap.set(round.roundId, winners);
      }
    });
  }

  private async calculateBallotRankedVotes(
    ballotId: number,
    round: BallotRound,
    campaignId: number,
    winnerMap: Map<number, Map<number, { votes: number }>>,
  ) {
    const votes = await this.repository.ballots.getBallotRankedVotes(
      ballotId,
      campaignId,
      round.roundId,
    );

    const scores = {};

    votes.forEach((vote) => {
      const numberOfVotes = round.numberOfVotes;
      const score = vote.votes * (numberOfVotes + 1 - vote.voteRank);

      if (!scores[vote.choiceId]) {
        scores[vote.choiceId] = score;
      } else {
        scores[vote.choiceId] += score;
      }
    });

    let winnerId;
    let maxScore = -Infinity;

    for (const choiceId in scores) {
      if (scores[choiceId] > maxScore) {
        maxScore = scores[choiceId];
        winnerId = choiceId;
      }
    }
    winnerMap.set(+round.roundId, new Map([[+winnerId, { votes: maxScore }]]));
  }
}
