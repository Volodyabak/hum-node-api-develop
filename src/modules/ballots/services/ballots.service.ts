import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 } from 'uuid';

import { BrackhitsContentService } from '../../brackhits-content/services/brackhits-content.service';
import { RepositoryService } from '../../repository/services/repository.service';
import {
  PostBallotChoiceDto,
  PostBallotCustomChoiceDto,
  PostBallotDto,
  PostUserBallotChoicesBody,
} from '../dto';
import { RestfulQuery } from '../../../decorators/restful-query.decorator';
import { formatGetBallotResponse } from '../utils/ballot-response.util';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';
import { ErrorConst } from '../../../constants';
import { BallotCategoryNamesModel, BallotModel, CampaignBallotModel } from '@database/Models';
import { CampaignUserLinkModel } from '@database/Models/campaign/campaign-user-link.model';
import { BrackhitContentTypeId } from '@database/Models/BrackhitContentTypeModel';
import { BrackhitContentType } from '../../brackhits/constants/brackhits.constants';
import { TrackInfoDto } from '../../tracks/tracks.dto';

@Injectable()
export class BallotsService {
  constructor(
    private readonly repository: RepositoryService,
    private readonly brackhitsContentService: BrackhitsContentService,
  ) {}

  async getBallots(restQuery: RestfulQuery) {
    const [ballots, total] = await Promise.all(this.repository.ballots.findBallots(restQuery));

    return {
      data: ballots,
      pagination: {
        skip: restQuery.paginationParams.skip,
        take: restQuery.paginationParams.take,
        total: total,
      },
    };
  }

  async createBallot(userId: string, body: PostBallotDto) {
    for (const category of body.categories) {
      let dbCategory = await BallotCategoryNamesModel.query()
        .findOne({
          categoryName: category.categoryName,
          detail: category.detail,
        })
        .skipUndefined();

      if (!dbCategory) {
        dbCategory = await BallotCategoryNamesModel.query()
          .insertAndFetch({
            categoryName: category.categoryName,
            detail: category.detail,
          })
          .onConflict()
          .ignore();
      }
      category.categoryId = dbCategory.id;
    }

    const categories = await Promise.all(
      body.categories.map(async (category) => {
        const contentTypeId = BrackhitContentTypeId[category.type];
        category.choices = await Promise.all(
          category.choices.map(async (choice) => {
            let content;

            if (category.type === BrackhitContentType.Custom) {
              const customChoice = choice as PostBallotCustomChoiceDto;
              content = await this.brackhitsContentService.getCustomContent({
                name: customChoice.name,
                thumbnail: customChoice.thumbnail,
                contentUrl: customChoice.contentUrl,
              });
              if (!content) {
                content = await this.brackhitsContentService.saveCustomContent(customChoice);
              }
            } else {
              const regularChoice = choice as PostBallotChoiceDto;
              content = await this.brackhitsContentService.getContent(
                regularChoice.id,
                category.type,
              );
              if (
                !content ||
                category.type === BrackhitContentType.Youtube ||
                (category.type === BrackhitContentType.Track && !(content as TrackInfoDto)?.preview)
              ) {
                content = await this.brackhitsContentService.saveContent(
                  regularChoice.id,
                  category.type,
                  regularChoice.data,
                );
              }
            }

            const dbChoice = await this.repository.brackhitRepo.findOrCreateBrackhitChoice({
              contentId: content.id,
              contentTypeId: contentTypeId,
            });

            choice.choiceId = dbChoice.choiceId;
            return choice;
          }),
        );

        return category;
      }),
    );

    const ballot = await BallotModel.query().insertGraph({
      ballotName: body.name,
      ownerId: userId,
      votingTypeId: body.votingTypeId,
      categoryCount: body.categories.length,
      categories: categories.map((category) => ({
        roundId: category.roundId,
        typeId: BrackhitContentTypeId[category.type],
        categoryId: category.categoryId,
        categorySize: category.choices.length,
        numberOfVotes: category.numberOfVotes,
        votingTypeId: category.votingTypeId,
        choices: category.choices.map((choice) => ({
          choiceId: choice.choiceId,
          roundId: category.roundId,
        })),
      })),
    });

    if (body.campaignId) {
      const campaignBallot = await CampaignBallotModel.query().findOne({
        campaignId: body.campaignId,
      });

      if (!campaignBallot) {
        await CampaignBallotModel.query().insert({
          campaignId: body.campaignId,
          ballotId: ballot.id,
        });
      } else {
        await campaignBallot.$query().patch({ ballotId: ballot.id });
      }
    }

    return this.getBallot(ballot.id, body.campaignId);
  }

  async getBallot(ballotId: number, campaignId?: number) {
    let campaign;
    const ballot = await this.repository.ballots
      .findBallot({ id: ballotId })
      .withGraphFetched(
        expr(
          [
            Relations.Categories,
            [Relations.ContentType],
            [Relations.CategoryName],
            [Relations.Choices, [Relations.ChoiceContent]],
          ],
          [Relations.Campaigns],
        ),
      );

    if (!ballot) {
      throw new NotFoundException(ErrorConst.BALLOT_NOT_FOUND);
    }

    if (campaignId) {
      campaign = ballot.campaigns?.find((el) => el.id === campaignId);

      if (!campaign) {
        throw new NotFoundException(ErrorConst.CAMPAIGN_DOES_NOT_BELONG_BALLOT);
      }
    }

    await Promise.all(
      ballot.categories.map(async (category) => {
        await Promise.all(
          category.choices.map(async (choice) => {
            choice.content = await this.brackhitsContentService.getContent(
              choice.choiceContent.contentId,
              category.contentType.type,
            );

            if (campaign && !!campaign?.useCustomNames) {
              choice.contentDetails = await this.repository.campaign.findCustomContentName({
                campaignId: campaignId,
                choiceId: choice.choiceId,
              });
            }
          }),
        );
      }),
    );

    return { ballot, campaign };
  }

  // todo: ensure this is not needed
  // async saveUserBallotChoices(
  //   ballotId: number,
  //   campaignId: number,
  //   body: PostUserBallotChoicesBody,
  // ) {
  //   const [ballot, campaignBallot] = await Promise.all([
  //     this.repository.ballots.findBallot({ id: ballotId }),
  //     this.repository.ballots.findCampaignBallot({ campaignId, ballotId }),
  //   ]);
  //
  //   let campaignUser = await this.repository.campaign
  //     .findCampaignUser({ email: body.user.email })
  //     .withGraphFetched(expr([Relations.CampaignUserBallot]));
  //   let campaignUserBallot = campaignUser?.campaignUserBallot?.find(
  //     (el) =>
  //       el.campaignBallotId === campaignBallot.id && el.campaignUserId === campaignUser.userId,
  //   );
  //
  //   if (!ballot) {
  //     throw new NotFoundException(ErrorConst.BALLOT_NOT_FOUND);
  //   }
  //
  //   if (!campaignBallot) {
  //     throw new NotFoundException(ErrorConst.CAMPAIGN_DOES_NOT_BELONG_BALLOT);
  //   }
  //
  //   if (!campaignUser) {
  //     campaignUser = await this.repository.campaign.insertCampaignUser({
  //       userId: v4(),
  //       ...body.user,
  //     });
  //   } else {
  //     campaignUser = await campaignUser.$query().patchAndFetch({ ...body.user });
  //   }
  //
  //   if (campaignUserBallot) {
  //     throw new Error(ErrorConst.USER_ALREADY_VOTED);
  //   }
  //
  //   [campaignUserBallot] = await Promise.all([
  //     this.repository.ballots.insertCampaignUserBallot({
  //       campaignId: campaignId,
  //       campaignUserId: campaignUser.userId,
  //       campaignBallotId: campaignBallot.id,
  //     }),
  //     CampaignUserLinkModel.query()
  //       .insert({
  //         campaignId: campaignId,
  //         userId: campaignUser.userId,
  //       })
  //       .onConflict()
  //       .ignore(),
  //   ]);
  //
  //   await Promise.all(
  //     body.rounds.map(async (round) => {
  //       await Promise.all(
  //         round.choices.map(async (choice) => {
  //           await this.repository.ballots.insertCampaignBallotUserChoice({
  //             campaignUserBallotId: campaignUserBallot.id,
  //             roundId: round.roundId,
  //             choiceId: choice.choiceId,
  //             voteRank: choice.voteRank,
  //           });
  //         }),
  //       );
  //     }),
  //   );
  //
  //   return { user: campaignUser };
  // }

  async getBallotSummary(ballotId: number, campaignId: number) {
    const { ballot, campaign } = await this.getBallot(ballotId, campaignId);

    if (!campaign) {
      throw new NotFoundException(ErrorConst.CAMPAIGN_NOT_FOUND);
    }

    const totalVotes = await this.repository.ballots.getBallotTotalVotes(ballotId, campaignId);
    const winnerMap = new Map<number, Map<number, { votes: number }>>();

    await Promise.all(
      ballot.categories.map(async (category) => {
        if (category.votingTypeId === 1) {
          const votes = await this.repository.ballots.getBallotVotes({
            ballotId,
            campaignId,
            roundId: category.roundId,
          });

          let maxVotes = 0;
          votes.forEach((vote) => {
            if (vote.votes > maxVotes) {
              maxVotes = vote.votes;
            }

            if (vote.votes === maxVotes) {
              const winners = winnerMap.get(category.roundId) || new Map();
              winners.set(vote.choiceId, { votes: vote.votes });
              winnerMap.set(category.roundId, winners);
            }
          });
        } else if (category.votingTypeId === 2) {
          const votes = await this.repository.ballots.getBallotRankedVotes(
            ballotId,
            campaignId,
            category.roundId,
          );

          const scores = {};

          votes.forEach((vote) => {
            const numberOfVotes = category.numberOfVotes;
            const score = vote.votes * (numberOfVotes + 1 - vote.voteRank);

            if (!scores[vote.choiceId]) {
              scores[vote.choiceId] = score;
            } else {
              scores[vote.choiceId] += score;
            }
          });

          let winnerId;
          let maxScore = -Infinity;

          for (const choiceId in scores) {
            if (scores[choiceId] > maxScore) {
              maxScore = scores[choiceId];
              winnerId = choiceId;
            }
          }
          winnerMap.set(+category.roundId, new Map([[+winnerId, { votes: maxScore }]]));
        }
      }),
    );

    ballot.categories.map((category) => {
      category.choices = category.choices
        .filter((choice) => {
          return winnerMap.get(choice.roundId).has(choice.choiceId);
        })
        .map((choice) => {
          return {
            ...choice,
            votes: winnerMap.get(choice.roundId).get(choice.choiceId).votes,
          } as any;
        });
    });
    const formattedBallot = formatGetBallotResponse(ballot, campaign);

    formattedBallot.categories.forEach((category) => {
      category['winners'] = category.choices.map((choice) => {
        const prop = category.votingTypeId === 1 ? 'votes' : 'bordaCount';
        return {
          ...choice,
          [prop]: winnerMap.get(category.roundId).get(choice.choiceId).votes,
        };
      });
      category.choices = undefined;
    });
    formattedBallot['totalVotes'] = totalVotes;

    return formattedBallot;
  }
}
