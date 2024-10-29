import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BrackhitContentType } from '../../../src/modules/brackhits/constants/brackhits.constants';

@Schema({ _id: false })
export class Choice {
  @Prop({ required: true })
  type: BrackhitContentType;

  @Prop({ required: true })
  choiceId: number;

  @Prop({ required: false })
  contentId?: number;

  @Prop({ required: false })
  isCorrect?: boolean;
}

export const ChoiceSchema = SchemaFactory.createForClass(Choice);
