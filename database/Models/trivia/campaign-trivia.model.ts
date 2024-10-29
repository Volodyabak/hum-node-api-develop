import { Model } from 'objection';
import { Relations } from '@database/relations/relations';
import { TriviaModel } from '@database/Models/trivia/trivia.model';

export class CampaignTriviaModel extends Model {
  id: number;
  campaignId: number;
  triviaId: string;

  trivia?: TriviaModel;

  static get tableName() {
    return 'labl.campaign_trivia';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Trivia]: {
        relation: Model.BelongsToOneRelation,
        modelClass: TriviaModel,
        join: {
          from: `${CampaignTriviaModel.tableName}.triviaId`,
          to: `${TriviaModel.tableName}.${TriviaModel.idColumn}`,
        },
      },
    };
  }
}
