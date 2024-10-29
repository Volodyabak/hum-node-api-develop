import { Model } from 'objection';

export enum BallotVotingTypeId {
  Unranked = 1,
  Ranked = 2,
}

export enum BallotVotingType {
  Unranked = 'Unranked',
  Ranked = 'Ranked',
}

export class BallotVotingTypeModel extends Model {
  id: BallotVotingTypeId;
  votingType: BallotVotingType;
  numberOfVotes: number;

  static get tableName() {
    return 'labl.ballot_voting_type';
  }

  static get idColumn() {
    return 'id';
  }
}
