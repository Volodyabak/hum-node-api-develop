import { v4 } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Choice, ChoiceSchema } from '@database/mongodb/games/common';
import AutoIncrementFactory from 'mongoose-sequence';
import { mongoConnection } from '../../../src/Tools/db';

export type BallotDocument = HydratedDocument<Ballot>;

const AutoIncrement = AutoIncrementFactory(mongoConnection);

export enum BallotRoundVoteType {
  Ranked = 'ranked', // 2
  Unranked = 'unranked', // 1
}

@Schema({ _id: false })
export class BallotRound {
  @Prop({ required: true })
  roundId: number;

  @Prop({ required: true, default: 1 })
  numberOfVotes: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  votingType: BallotRoundVoteType;

  @Prop({ type: [ChoiceSchema], default: [] })
  choices: Choice[];
}

export const BallotRoundSchema = SchemaFactory.createForClass(BallotRound);

@Schema()
export class Ballot {
  @Prop({ type: Number, unique: true })
  ballotId: number;

  @Prop({ type: String, default: v4() })
  uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  thumbnail?: string;

  @Prop({ type: [BallotRoundSchema], default: [] })
  rounds: BallotRound[];
}

export const BallotSchema = SchemaFactory.createForClass(Ballot);

BallotSchema.plugin(AutoIncrement, { inc_field: 'ballotId', start_seq: 1000 });
