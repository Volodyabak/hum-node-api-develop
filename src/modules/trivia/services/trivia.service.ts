import { Injectable } from '@nestjs/common';
import { Relations } from '@database/relations/relations';
import { expr } from '@database/relations/relation-builder';
import { RepositoryService } from '../../repository/services/repository.service';
import { TriviaRepository } from '../../repository/repositories/trivia/trivia.repository';
import { BrackhitsContentService } from '../../brackhits-content/services/brackhits-content.service';
import { CreateTriviaDto } from '../dto/input/create-trivia.dto';
import { TriviaModel } from '@database/Models/trivia/trivia.model';
import { BrackhitContentTypeId } from '@database/Models/BrackhitContentTypeModel';
import { BrackhitContentType } from '../../brackhits/constants/brackhits.constants';
import {
  BrackhitContentDto,
  BrackhitCustomContentDto,
} from '../../brackhits-content/dto/input/brackhit-content.dto';
import { TrackInfoDto } from '../../tracks/tracks.dto';

@Injectable()
export class TriviaService {
  private triviaRepo: TriviaRepository;

  constructor(
    private readonly repoService: RepositoryService,
    private readonly contentService: BrackhitsContentService,
  ) {
    this.triviaRepo = repoService.trivia;
  }

  async createTrivia(userId: string, body: CreateTriviaDto) {
    await Promise.all(
      body.questions.map(async (question) => {
        await Promise.all(
          question.choices.map(async (choice) => {
            let content;

            if (question.type === BrackhitContentType.Custom) {
              const customChoice = choice as BrackhitCustomContentDto;
              content = await this.contentService.getCustomContent({
                name: customChoice.name,
                thumbnail: customChoice.thumbnail,
                contentUrl: customChoice.contentUrl,
              });
              if (!content) {
                content = await this.contentService.saveCustomContent({
                  name: customChoice.name,
                  thumbnail: customChoice.thumbnail,
                  contentUrl: customChoice.contentUrl,
                });
              }
            } else {
              const regularChoice = choice as BrackhitContentDto;
              content = await this.contentService.getContent(regularChoice.id, question.type);
              if (
                !content ||
                question.type === BrackhitContentType.Youtube ||
                (question.type === BrackhitContentType.Track && !(content as TrackInfoDto)?.preview)
              ) {
                content = await this.contentService.saveContent(
                  regularChoice.id,
                  question.type,
                  regularChoice.data,
                );
              }
            }

            const dbChoice = await this.repoService.brackhitRepo.findOrCreateBrackhitChoice({
              contentId: content.id,
              contentTypeId: BrackhitContentTypeId[question.type],
            });

            choice.choiceId = dbChoice.choiceId;

            return choice;
          }),
        );
      }),
    );

    const trx = await TriviaModel.startTransaction();
    try {
      const trivia = await TriviaModel.query(trx).insertGraph(
        {
          triviaName: body.name,
          ownerId: userId,
          questionCount: body.questions.length,
          questions: body.questions.map((question, i) => ({
            roundId: i + 1,
            questionSize: question.choices.length,
            typeId: BrackhitContentTypeId[question.type],
            prompt: { promptName: question.name },
            resolution: question.resolution ? { ...question.resolution } : null,
            answers: question.choices.map((choice) => ({
              roundId: i + 1,
              choiceId: choice.choiceId,
              isCorrect: choice.isCorrect,
            })),
          })),
        },
        { relate: true },
      );

      await trx.commit();
      return this.getTriviaById(trivia.id);
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async getTriviaById(id: number) {
    const trivia = await this.triviaRepo
      .findOne({ id })
      .withGraphFetched(
        expr([
          Relations.Questions,
          [Relations.Answers, [Relations.ChoiceContent]],
          [Relations.Prompt],
          [Relations.Type],
          [Relations.Resolution],
        ]),
      );

    await Promise.all(
      trivia.questions.map(async (question) => {
        await Promise.all(
          question.answers.map(async (answer) => {
            answer.content = await this.contentService.getContent(
              answer.choiceContent.contentId,
              question.type.contentType,
            );
          }),
        );
      }),
    );

    return trivia;
  }

  async getUserTrivias(userId: string) {
    const trivias = await this.triviaRepo
      .find({ ownerId: userId })
      .withGraphFetched(
        expr([
          Relations.Questions,
          [Relations.Answers, [Relations.ChoiceContent]],
          [Relations.Prompt],
          [Relations.Type],
          [Relations.Resolution],
        ]),
      );

    await Promise.all(
      trivias.map(async (t) => {
        await Promise.all(
          t.questions.map(async (question) => {
            await Promise.all(
              question.answers.map(async (answer) => {
                answer.content = await this.contentService.getContent(
                  answer.choiceContent.contentId,
                  question.type.contentType,
                );
              }),
            );
          }),
        );
      }),
    );

    return trivias;
  }
}
