import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Choice, ChoiceSchema } from '@database/mongodb/games/common';
import { v4 } from 'uuid';

export type TriviaDocument = HydratedDocument<Trivia>;

@Schema({ _id: false })
export class TriviaQuestion {
  @Prop({ required: true })
  prompt: string;

  @Prop({ required: false })
  countdownClock: number;

  @Prop({ required: false })
  allowMultipleSelection: boolean;

  @Prop([ChoiceSchema])
  choices: Choice[];

  @Prop({
    required: true,
    type: {
      _id: false,
      choiceIds: [Number],
      feedback: {
        successText: String,
        failText: String,
        thumbnail: String,
        detailText: String,
      },
    },
  })
  resolve: {
    choiceIds: number[];
    feedback: {
      successText: string;
      failText: string;
      thumbnail: string;
      detailText: string;
    };
  };
}

export const TriviaQuestionSchema = SchemaFactory.createForClass(TriviaQuestion);

@Schema({ _id: false })
export class TriviaRound {
  @Prop({ required: true })
  roundId: number;

  @Prop({ required: true })
  level: number;

  @Prop({ required: false })
  thumbnail: string;

  @Prop({ required: true, type: TriviaQuestionSchema })
  question: TriviaQuestion;
}

export const TriviaRoundSchema = SchemaFactory.createForClass(TriviaRound);

@Schema()
export class Trivia {
  @Prop({ type: String, default: v4() })
  uuid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: false })
  thumbnail: string;

  @Prop({ required: false })
  gameType: string;

  @Prop({ required: true })
  questionCount: number;

  @Prop({ required: false })
  pointsPerCorrectAnswer: number;

  @Prop({ required: false })
  lives: number;

  @Prop({ required: false })
  endOnFirstWrongAnswer: boolean;

  @Prop({ required: false })
  allowRetry: boolean;

  @Prop({ required: false })
  multipleLevels: boolean;

  @Prop({ required: false })
  pullFromQuestionBank: boolean;

  @Prop({ required: false })
  questionBankId: string;

  @Prop([TriviaRoundSchema])
  rounds: TriviaRound[];
}

export const TriviaSchema = SchemaFactory.createForClass(Trivia);
