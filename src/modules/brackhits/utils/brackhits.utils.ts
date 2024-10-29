import { BrackhitWithStatusDto, LiveBrackhitDto } from '../dto/brackhits.dto';
import {
  ARTISTORY_NAME,
  BRACKHIT_URL_BASE,
  BrackhitSize,
  BrackhitUserStatus, DEV_BRACKHIT_URL_BASE,
} from '../constants/brackhits.constants';
import {
  BrackhitChoiceWinnerWithPercent,
  BrackhitChoiceWithVotes,
  BrackhitWithSize,
  DailyBrackhitCompletion,
} from '../interfaces/brackhits.interface';
import { BrackhitMetaDto } from '../dto/brackhits-home.dto';
import { QueryBuilder } from 'objection';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { BrackhitMatchupsModel } from '../../../../database/Models/BrackhitMatchupsModel';
import { Environment } from '../../../constants';

export class BrackhitsUtils {
  static getStartingRound(size: number): number {
    return size > 16 ? 1 : 16 - size + 1;
  }

  static getNextRound(round: number): number | null {
    if ([1, 2].includes(round)) return 9;
    if ([3, 4].includes(round)) return 10;
    if ([5, 6].includes(round)) return 11;
    if ([7, 8].includes(round)) return 12;
    if ([9, 10].includes(round)) return 13;
    if ([11, 12].includes(round)) return 14;
    if ([13, 14].includes(round)) return 15;
    return null;
  }

  static getPreviousRounds(round: number): [number, number] | null {
    if (round === 15) return [13, 14];
    if (round === 14) return [11, 12];
    if (round === 13) return [9, 10];
    if (round === 12) return [7, 8];
    if (round === 11) return [5, 6];
    if (round === 10) return [3, 4];
    if (round === 9) return [1, 2];
    return null;
  }

  static getRoundCoefficient(round: number): number {
    if (round >= 1 && round <= 8) {
      return 1;
    } else if (round >= 9 && round <= 12) {
      return 2;
    } else if (round === 13 || round === 14) {
      return 4;
    } else if (round === 15) {
      return 8;
    }
  }

  // Checks whether a brackhit is live, requires valid brackhit timeLive and duration values
  static isLiveBrackhit(brackhit: LiveBrackhitDto, date: Date): 0 | 1 {
    const isLive = brackhit.timeLive.getTime() + brackhit.duration * 3600 * 1000 > date.getTime();
    return isLive ? 1 : 0;
  }

  // Identifies brackhit userStatus by brackhit isCompleted and scoringState properties
  static identifyUserBrackhitStatus(brackhit: BrackhitWithStatusDto): BrackhitUserStatus {
    if (brackhit.isCompleted === 0) {
      return BrackhitUserStatus.InProgress;
    } else if (brackhit.isCompleted === 1) {
      if (brackhit.scoringState === 2) {
        return BrackhitUserStatus.Results;
      } else {
        return BrackhitUserStatus.Completed;
      }
    } else {
      return BrackhitUserStatus.None;
    }
  }

  static isDailyBrackhitCompleted(b: DailyBrackhitCompletion): boolean {
    if (b.isComplete === null) {
      return false;
    } else if (b.isComplete === 1) {
      return (
        b.date.getTime() === b.initialCompleteTime?.getTime() ||
        b.date.getTime() === b.updatedAt.getTime()
      );
    } else if (b.isComplete === 0) {
      return b.initialCompleteTime !== null && b.date.getTime() === b.initialCompleteTime.getTime();
    }
  }

  static getDailyBrackhitsStreak(completions: (0 | 1)[]): number {
    const completionsCopy = [...completions];
    const todayCompletion = completionsCopy.shift();
    const lastMissedDailyIndex = completionsCopy.findIndex((el) => el === 0);
    const consecutiveCompletions =
      lastMissedDailyIndex === -1 ? completionsCopy.length : lastMissedDailyIndex;

    return consecutiveCompletions + todayCompletion;
  }

  // determines early game round based on brackhit size
  static isEarlyBrackhitRound(brackhit: BrackhitWithSize, roundId: number): boolean {
    const size = brackhit.size;

    if (size === BrackhitSize._2) return roundId <= 15;
    if (size === BrackhitSize._4) return roundId <= 14;
    if (size === BrackhitSize._8) return roundId <= 12;
    if (size === BrackhitSize._16) return roundId <= 8;
    if (size === BrackhitSize._32) return roundId <= 16;
    if (size === BrackhitSize._64) return roundId <= 32;
  }

  static getQuarterFinalsRounds(brackhit: BrackhitWithSize): number[] {
    if (brackhit.size === BrackhitSize._2) return [15];
    if (brackhit.size === BrackhitSize._4) return [13, 14];
    if (brackhit.size === BrackhitSize._8) return [13, 14];
    if (brackhit.size === BrackhitSize._16) return [9, 10, 11, 12];
  }

  static getBrackhitMeta(
    brackhitsQB: QueryBuilder<BrackhitModel, BrackhitModel[]>,
  ): QueryBuilder<BrackhitModel, BrackhitMetaDto[]> {
    return brackhitsQB
      .select(
        'b.brackhitId',
        'b.name',
        'b.thumbnail',
        'b.timeLive',
        'b.duration',
        'b.scoringState',
        'bu.isComplete as isCompleted',
      )
      .castTo<BrackhitMetaDto[]>();
  }

  static isArtistory(ownerId: string) {
    return ownerId === ARTISTORY_NAME;
  }

  static getBrackhitWinnersWithPercent(
    brackhit: BrackhitWithSize,
    matchups: BrackhitMatchupsModel[],
    results: BrackhitChoiceWithVotes[],
  ): BrackhitChoiceWinnerWithPercent[] {
    const winners = results.filter((el) => el.winner);
    const seedsMap = new Map(matchups.map((el) => [el.choiceId, el.seed]));

    return winners.map((choice) => {
      const roundChoices = results.filter((el) => el.roundId === choice.roundId);
      let percent: number;

      if (BrackhitsUtils.isEarlyBrackhitRound(brackhit, choice.roundId)) {
        const totalVotes = roundChoices.reduce((prev, curr) => prev + curr.votes, 0);
        percent = choice.votes / totalVotes;
      } else {
        const previousRounds = BrackhitsUtils.getPreviousRounds(choice.roundId);
        const previousWinners = winners
          .filter((el) => previousRounds.includes(el.roundId))
          .map((el) => el.choiceId);
        const previousWinnersVotes = roundChoices
          .filter((el) => previousWinners.includes(el.choiceId))
          .reduce((prev, curr) => prev + curr.votes, 0);
        percent = choice.votes / previousWinnersVotes;
      }

      return { ...choice, percent, seed: seedsMap.get(choice.choiceId) };
    });
  }

  static seeding(numPlayers: number) {
    function nextLayer(pls: number[]) {
      const out = [];
      const length = pls.length * 2 + 1;
      pls.forEach(function (d) {
        out.push(d);
        out.push(length - d);
      });
      return out;
    }

    const rounds = Math.log(numPlayers) / Math.log(2) - 1;
    let pls = [1, 2];
    for (let i = 0; i < rounds; i++) {
      pls = nextLayer(pls);
    }
    return pls;
  }

  static getSeedForIndex(index: number) {
    if (index === 0) return 1;
    if (index === 1) return 16;
    if (index === 2) return 8;
    if (index === 3) return 9;
    if (index === 4) return 5;
    if (index === 5) return 12;
    if (index === 6) return 4;
    if (index === 7) return 13;
    if (index === 8) return 3;
    if (index === 9) return 14;
    if (index === 10) return 6;
    if (index === 11) return 11;
    if (index === 12) return 7;
    if (index === 13) return 10;
    if (index === 14) return 2;
    if (index === 15) return 15;
  }

  static getBrackhitUrl(brackhitId: number) {
    const url =
      process.env.NODE_ENV === Environment.PROD ? BRACKHIT_URL_BASE : DEV_BRACKHIT_URL_BASE;
    return url + brackhitId;
  }
}
