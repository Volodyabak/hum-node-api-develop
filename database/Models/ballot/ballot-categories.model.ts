import { Model } from 'objection';
import { BrackhitTypeModel } from '../Brackhit';
import { Relations } from '../../relations/relations';
import { BallotMatchupsModel, BallotCategoryNamesModel } from '@database/Models';

export class BallotCategoriesModel extends Model {
  id: number;
  ballotId: number;
  roundId: number;
  typeId: number;
  categoryId: number;
  categorySize: number;
  numberOfVotes: number;
  votingTypeId: number;

  categoryName?: BallotCategoryNamesModel;
  contentType?: BrackhitTypeModel;
  choices?: BallotMatchupsModel[];

  static get tableName() {
    return 'labl.ballot_categories';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.CategoryName]: {
        relation: Model.HasOneRelation,
        modelClass: BallotCategoryNamesModel,
        join: {
          from: `${this.tableName}.categoryId`,
          to: `${BallotCategoryNamesModel.tableName}.id`,
        },
      },

      [Relations.ContentType]: {
        relation: Model.HasOneRelation,
        modelClass: BrackhitTypeModel,
        join: {
          from: `${this.tableName}.typeId`,
          to: `${BrackhitTypeModel.tableName}.typeId`,
        },
      },

      [Relations.Choices]: {
        relation: Model.HasManyRelation,
        modelClass: BallotMatchupsModel,
        join: {
          from: [`${this.tableName}.ballotId`, `${this.tableName}.roundId`],
          to: [
            `${BallotMatchupsModel.tableName}.ballotId`,
            `${BallotMatchupsModel.tableName}.roundId`,
          ],
        },
      },
    };
  }
}
