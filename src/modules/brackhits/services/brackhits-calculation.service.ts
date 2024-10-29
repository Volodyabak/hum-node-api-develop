import { Injectable, Logger } from '@nestjs/common';
import { maxBy, minBy, sumBy } from 'lodash';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { BrackhitUserChoicesModel } from '../../../../database/Models/BrackhitUserChoicesModel';
import { BrackhitScoringState } from '../constants/brackhits.constants';
import { BrackhitsUtils } from '../utils/brackhits.utils';
import { BrackhitChoiceWithVotes, BrackhitWithSize } from '../interfaces/brackhits.interface';
import { BrackhitResultsModel } from '../../../../database/Models/BrackhitResultsModel';
import { BrackhitUserModel } from '../../../../database/Models/BrackhitUserModel';
import { BrackhitUserScoreModel } from '../../../../database/Models/BrackhitUserScoreModel';
import { Transaction } from 'objection';

@Injectable()
export class BrackhitsCalculationService {
  private readonly _logger = new Logger(BrackhitsCalculationService.name);

  async calculateBrackhitResults(brackhitId: number, trx?: Transaction): Promise<void> {
    try {
      await BrackhitModel.query(trx)
        .update({ scoringState: BrackhitScoringState.CALCULATING })
        .where({ brackhitId });

      await this.calculateBrackhitWinners(brackhitId, trx);
      await this.calculateUserScores(brackhitId, trx);
      await this.calculatePointBins(brackhitId, trx);

      await BrackhitModel.query(trx)
        .update({ scoringState: BrackhitScoringState.CALCULATED })
        .where({ brackhitId });
    } catch (err) {
      this._logger.log(err);
      throw err;
    }
  }

  private async calculateBrackhitWinners(brackhitId: number, trx?: Transaction) {
    try {
      const brackhit = await BrackhitModel.query().findById(brackhitId);
      const votes = await BrackhitUserChoicesModel.query()
        .alias('buc')
        .select('buc.brackhitId', 'buc.roundId', 'buc.choiceId')
        .count({ votes: '*' })
        .leftJoin(
          BrackhitUserModel.getTableNameWithAlias('bu'),
          BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnUserId('bu', 'buc'),
        )
        .where({
          'buc.brackhitId': brackhitId,
          'bu.isComplete': 1,
        })
        .groupBy(['roundId', 'choiceId'])
        .orderBy('roundId')
        .orderBy('votes', 'desc')
        .castTo<BrackhitChoiceWithVotes[]>();

      const winners = await this.calculateBrackhitWinnersFromVotes(brackhit, votes);

      await BrackhitResultsModel.query(trx)
        .toKnexQuery()
        .insert(Array.from(winners).flat())
        .onConflict()
        .merge();
    } catch (err) {
      this._logger.log(err);
      throw err;
    }
  }

  async calculateBrackhitWinnersFromVotes(
    brackhit: BrackhitWithSize,
    votes: BrackhitChoiceWithVotes[],
  ): Promise<BrackhitChoiceWithVotes[]> {
    const roundsMap = new Map<number, BrackhitChoiceWithVotes[]>();
    const winners = new Map<number, BrackhitChoiceWithVotes>();

    votes.forEach((choice) => {
      if (!roundsMap.has(choice.roundId)) {
        const roundChoices = votes.filter((el) => el.roundId === choice.roundId);
        roundChoices.forEach((el) => (el.winner = 0));
        roundsMap.set(choice.roundId, roundChoices);
      }
    });

    roundsMap.forEach((choices, round) => {
      if (BrackhitsUtils.isEarlyBrackhitRound(brackhit, round)) {
        const [choice1, choice2] = choices;
        let winner = choice1;
        if (choice1?.votes === choice2?.votes) {
          winner = this.getWinnerBasedOnNextRounds(round, [choice1, choice2], roundsMap);
        }
        winner.winner = 1;
        winners.set(round, winner);
      } else {
        this.selectWinnerBasedOnPreviousRounds(round, choices, roundsMap, winners);
      }
    });

    return Array.from(roundsMap.values()).flat();
  }

  private async calculateUserScores(brackhitId: number, trx?: Transaction): Promise<void> {
    try {
      type UserChoicesType = BrackhitUserChoicesModel & BrackhitUserModel;

      const [userChoices, brackhitResults, usersCount] = await Promise.all([
        BrackhitUserChoicesModel.query()
          .alias('buc')
          .select('buc.*', 'bu.*')
          .leftJoin(
            BrackhitUserModel.getTableNameWithAlias('bu'),
            BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnUserId('bu', 'buc'),
          )
          .where('buc.brackhitId', brackhitId)
          .where('bu.isComplete', 1)
          .castTo<UserChoicesType[]>(),
        BrackhitResultsModel.query().where({ brackhitId }),
        BrackhitUserModel.query().where({ brackhitId, isComplete: 1 }).resultSize(),
      ]);

      const resultsMap = new Map<number, Map<number, number>>();
      const pointsMap = new Map<string, number>(userChoices.map((el) => [el.userId, 0]));

      brackhitResults.forEach((el) => {
        const roundChoices = resultsMap.get(el.roundId);
        if (!roundChoices) {
          resultsMap.set(el.roundId, new Map([[el.choiceId, el.votes]]));
        } else {
          roundChoices.set(el.choiceId, el.votes);
        }
      });

      userChoices.forEach((choice) => {
        const votes = resultsMap.get(choice.roundId).get(choice.choiceId);
        const share = +(votes / usersCount).toPrecision(3);
        const roundCoefficient = BrackhitsUtils.getRoundCoefficient(choice.roundId);
        const points = Math.ceil((1 - share) * 9 * roundCoefficient);

        pointsMap.set(choice.userId, pointsMap.get(choice.userId) + points);
      });

      await Promise.all(
        Array.from(pointsMap).map(([userId, score]) => {
          return Promise.all([
            BrackhitUserScoreModel.query(trx)
              .insert({ brackhitId, userId, score })
              .onConflict()
              .merge(),
            // this.transactionService.insertEndedBrackhitResultsAward(brackhitId, userId, score, trx),
          ]);
        }),
      );
    } catch (err) {
      this._logger.log(err);
      throw err;
    }
  }

  private async calculatePointBins(brackhitId: number, trx?: Transaction) {
    try {
      const brackhitResults = await BrackhitResultsModel.query().where({ brackhitId });

      const roundsMap = new Map<number, BrackhitResultsModel[]>();
      brackhitResults.forEach((choice) => {
        if (!roundsMap.has(choice.roundId)) {
          const roundChoices = brackhitResults.filter((el) => el.roundId === choice.roundId);
          roundsMap.set(choice.roundId, roundChoices);
        }
      });

      let highCoefficient = 0;
      let lowCoefficient = 0;
      roundsMap.forEach((choices, round) => {
        const min = minBy(choices, (el) => el.votes);
        const max = maxBy(choices, (el) => el.votes);
        const sum = sumBy(choices, (el) => el.votes);

        const high = 1 - min.votes / sum;
        const low = 1 - max.votes / sum;

        highCoefficient += 9 * BrackhitsUtils.getRoundCoefficient(round) * high;
        lowCoefficient += 9 * BrackhitsUtils.getRoundCoefficient(round) * low;
      });

      const high = (2 / 3) * highCoefficient + (1 / 3) * lowCoefficient;
      const low = (1 / 3) * highCoefficient + (2 / 3) * lowCoefficient;

      const userScores = await BrackhitUserScoreModel.query().where({ brackhitId });

      await Promise.all(
        userScores.map(({ brackhitId, userId, score }) => {
          let bin = 3;
          if (score > high) {
            bin = 1;
          } else if (score < high && score > low) {
            bin = 2;
          }

          return BrackhitUserScoreModel.query(trx).update({ bin }).where({ brackhitId, userId });
        }),
      );
    } catch (err) {
      this._logger.log(err);
      throw err;
    }
  }

  private getWinnerBasedOnNextRounds(
    round: number,
    initialChoices: [BrackhitChoiceWithVotes, BrackhitChoiceWithVotes],
    roundsMap: Map<number, BrackhitChoiceWithVotes[]>,
  ): BrackhitChoiceWithVotes {
    if (round === 15) {
      return initialChoices[0];
    }

    const nextRound = BrackhitsUtils.getNextRound(round);
    const choiceIds = initialChoices.map((el) => el.choiceId);

    const nextRoundChoices = roundsMap
      .get(nextRound)
      .filter((el) => choiceIds.includes(el.choiceId));

    if (!nextRoundChoices.length) {
      return initialChoices[0];
    } else if (nextRoundChoices.length === 1) {
      return initialChoices.find((el) => el.choiceId === nextRoundChoices[0].choiceId);
    } else {
      if (nextRoundChoices[0].votes === nextRoundChoices[1].votes) {
        return this.getWinnerBasedOnNextRounds(nextRound, initialChoices, roundsMap);
      } else {
        return initialChoices.find((el) => el.choiceId === nextRoundChoices[0].choiceId);
      }
    }
  }

  private selectWinnerBasedOnPreviousRounds(
    round: number,
    choices: BrackhitChoiceWithVotes[],
    roundsMap: Map<number, BrackhitChoiceWithVotes[]>,
    winnersMap: Map<number, BrackhitChoiceWithVotes>,
  ) {
    const [round1, round2] = BrackhitsUtils.getPreviousRounds(round);
    const previousWinners = [winnersMap.get(round1), winnersMap.get(round2)];
    const previousWinnersIds = previousWinners.map((el) => el.choiceId);

    const [choice1, choice2] = choices.filter((el) => previousWinnersIds.includes(el.choiceId));
    let winner = choice1;

    if (!choice1 && !choice2) {
      winner = choices[0];
    } else {
      if (choice1?.votes === choice2?.votes) {
        winner = this.getWinnerBasedOnNextRounds(round, [choice1, choice2], roundsMap);
      }
    }

    winner.winner = 1;
    winnersMap.set(round, winner);
  }
}
