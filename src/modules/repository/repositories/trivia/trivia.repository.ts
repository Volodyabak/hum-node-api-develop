import { Injectable } from '@nestjs/common';
import { TriviaModel } from '@database/Models/trivia/trivia.model';
import { CampaignUserTriviaModel } from '@database/Models/trivia/campaign-user-trivia.model';
import { CampaignTriviaModel } from '@database/Models/trivia/campaign-trivia.model';
import { CampaignTriviaUserChoiceModel } from '@database/Models/trivia/campaign-trivia-user-choice.model';
import { TriviaAnswersModel } from '@database/Models/trivia/trivia-answers.model';
import { CampaignTriviaUserAttemptsModel } from '@database/Models/campaign/campaign-trivia-user-attempts.model';

@Injectable()
export class TriviaRepository {
  findOne(data: Partial<TriviaModel>) {
    return TriviaModel.query().findOne(data);
  }

  find(data: Partial<TriviaModel>) {
    return TriviaModel.query().where(data);
  }

  findTriviaAnswers(data: Partial<TriviaAnswersModel>) {
    return TriviaAnswersModel.query().where(data);
  }

  findCampaignTrivia(data: Partial<CampaignTriviaModel>) {
    return CampaignTriviaModel.query().findOne(data);
  }

  insertCampaignTrivia(data: Partial<CampaignTriviaModel>) {
    return CampaignTriviaModel.query().insertAndFetch(data);
  }

  findCampaignUserTrivia(data: Partial<CampaignUserTriviaModel>) {
    return CampaignUserTriviaModel.query().findOne(data);
  }

  insertCampaignUserTrivia(data: Partial<CampaignUserTriviaModel>) {
    return CampaignUserTriviaModel.query().insertAndFetch(data);
  }

  insertCampaignUserTriviaAttempt(data: Partial<CampaignTriviaUserAttemptsModel>) {
    return CampaignTriviaUserAttemptsModel.query().insertAndFetch(data);
  }

  insertTriviaUserChoice(data: Partial<CampaignTriviaUserChoiceModel>) {
    return CampaignTriviaUserChoiceModel.query().insertAndFetch(data);
  }

  deleteTriviaUserChoice(data: Partial<CampaignTriviaUserChoiceModel>) {
    return CampaignTriviaUserChoiceModel.query().delete().where(data);
  }
}
