import { Injectable } from '@nestjs/common';
import { BrackhitRepository } from './brackhit.repository';
import { BrackhitChallengesModel } from '../../../../../database/Models';
import { expr } from '../../../../../database/relations/relation-builder';
import { Relations } from '../../../../../database/relations/relations';
import { BrackhitModel } from '../../../../../database/Models/BrackhitModel';
import { PartialModelObject } from 'objection';

@Injectable()
export class BrackhitChallengeRepository {
  constructor(private readonly brackhitRepository: BrackhitRepository) {}

  getActiveChallenges(date: Date) {
    return BrackhitChallengesModel.query()
      .alias('bc')
      .where('bc.startDate', '<=', date)
      .andWhere('bc.endDate', '>=', date);
  }

  getChallenge(data: PartialModelObject<BrackhitChallengesModel>) {
    return BrackhitChallengesModel.query().alias('bc').findOne(data);
  }

  getChallengeLeaderboard(genreId: number, startDate: Date, endDate: Date) {
    const completionsQB = this.brackhitRepository
      .getBrackhitsCompletions('completions')
      .where('bu.updatedAt', '<=', endDate);

    const brackhitsQB = BrackhitModel.query()
      .alias('b')
      .leftJoinRelated(expr([Relations.AwsUser, 'u']))
      .join(completionsQB.as('comp'), 'comp.brackhitId', 'b.brackhitId')
      .whereNot('b.ownerId', 'artistory')
      .whereNot('u.staff', 1)
      .whereBetween('b.timeLive', [startDate, endDate]);

    if (genreId) {
      brackhitsQB.joinRelated(expr([Relations.BrackhitGenres, 'bg'])).where('bg.genreId', genreId);
    }

    return brackhitsQB;
  }

  saveChallenge(data: PartialModelObject<BrackhitChallengesModel>) {
    return BrackhitChallengesModel.query().insertAndFetch(data);
  }
}
