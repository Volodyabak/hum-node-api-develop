import { Injectable } from '@nestjs/common';
import { raw } from 'objection';

import {
  CampaignModel,
  CampaignBrackhitUserChoiceModel,
  CampaignLogsModel,
  CampaignUserBrackhitModel,
  CampaignUserModel,
  CampaignSlugModel,
  CampaignUserAgentModel,
  CampaignLogActionModel,
  CampaignLogSlugModel,
  CampaignUserShareSlugsModel,
  CampaignLogShareSlugModel,
  CampaignCustomContentNameModel,
  CampaignBrackhitModel,
  CampaignBallotModel,
  CampaignUserBallotModel,
} from '@database/Models';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';
import { CampaignSpotifyScopesModel } from '@database/Models/campaign/campaign-spotify-scopes.model';
import { CampaignUserLinkModel } from '@database/Models/campaign/campaign-user-link.model';
import { CompanyQrCodeModel } from '@database/Models/qr-code/company-qr-code.model';
import { CampaignUserDataModel } from '@database/Models/campaign/campaign-user-data.model';

@Injectable()
export class CampaignRepository {
  findCampaign(data: Partial<CampaignModel>) {
    return CampaignModel.query().findOne(data);
  }

  findCampaigns(data: Partial<CampaignModel>) {
    return CampaignModel.query().where(data);
  }

  insertCampaign(data: Partial<CampaignModel>) {
    return CampaignModel.query().insertAndFetch(data);
  }

  deleteCampaign(campaignId: number) {
    return CampaignModel.query().deleteById(campaignId);
  }

  findCampaignUser(data: Partial<CampaignUserModel>) {
    return CampaignUserModel.query().findOne(data);
  }

  linkUserToCampaign(data: Partial<CampaignUserLinkModel>) {
    return CampaignUserLinkModel.query().insertAndFetch(data);
  }

  insertCampaignBrackhit(data: Partial<CampaignBrackhitModel>) {
    return CampaignBrackhitModel.query().insertAndFetch(data);
  }

  findCampaignBrackhit(data: Partial<CampaignBrackhitModel>) {
    return CampaignBrackhitModel.query().findOne(data);
  }

  insertCampaignBallot(data: Partial<CampaignBallotModel>) {
    return CampaignBallotModel.query().insertAndFetch(data);
  }

  findCampaignBallot(data: Partial<CampaignBallotModel>) {
    return CampaignBallotModel.query().findOne(data);
  }

  insertCampaignUser(data: Partial<CampaignUserModel>) {
    return CampaignUserModel.query().insertAndFetch(data);
  }

  insertCampaignUserData(data: Partial<CampaignUserDataModel>) {
    return CampaignUserDataModel.query().insertAndFetch(data);
  }

  findCampaignUserBrackhit(data: Partial<CampaignUserBrackhitModel>) {
    return CampaignUserBrackhitModel.query().findOne(data);
  }

  insertCampaignUserBrackhit(data: Partial<CampaignUserBrackhitModel>) {
    return CampaignUserBrackhitModel.query().insertAndFetch(data);
  }

  async updateCampaignUserBrackhit(
    where: Partial<CampaignUserBrackhitModel>,
    data: Partial<CampaignUserBrackhitModel>,
  ) {
    await CampaignUserBrackhitModel.query().patch(data).where(where);
    return this.findCampaignUserBrackhit(where);
  }

  deleteCampaignUserBrackhit(data: Partial<CampaignUserBrackhitModel>) {
    return CampaignUserBrackhitModel.query().delete().where(data);
  }

  findCampaignUserBrackhitChoices(data: Partial<CampaignBrackhitUserChoiceModel>) {
    return CampaignBrackhitUserChoiceModel.query().where(data);
  }

  insertCampaignUserBrackhitChoices(
    campaignUserBrackhitId: number,
    choices: { roundId: number; choiceId: number }[],
  ) {
    return Promise.all(
      choices.map((el) =>
        CampaignBrackhitUserChoiceModel.query().insertAndFetch({
          campaignUserBrackhitId: campaignUserBrackhitId,
          roundId: el.roundId,
          choiceId: el.choiceId,
        }),
      ),
    );
  }

  async updateCampaignUserBrackhitChoices(
    campaignUserBrackhitId: number,
    choices: { roundId: number; choiceId: number }[],
  ) {
    await Promise.all(
      choices.map(({ roundId, choiceId }) =>
        CampaignBrackhitUserChoiceModel.query()
          .patch({ roundId, choiceId })
          .where({ campaignUserBrackhitId, roundId }),
      ),
    );
    return this.findCampaignUserBrackhitChoices({ campaignUserBrackhitId });
  }

  getCampaignBrackhitVotes(campaignId: number, brackhitId: number) {
    return CampaignBrackhitModel.query()
      .alias('cb')
      .select('cbuc.*')
      .count('* as votes')
      .leftJoin('labl.campaign_user_brackhit as cub', 'cub.campaignBrackhitId', 'cb.id')
      .leftJoin(
        'labl.campaign_brackhit_user_choice as cbuc',
        'cbuc.campaignUserBrackhitId',
        'cub.id',
      )
      .leftJoin('labl.campaign as c', 'c.id', 'cub.campaignId')
      .where({
        'cb.campaignId': campaignId,
        'cb.brackhitId': brackhitId,
      })
      .groupBy('cbuc.roundId', 'cbuc.choiceId');
  }

  deleteCampaignUserBrackhitChoices(data: Partial<CampaignBrackhitUserChoiceModel>) {
    return CampaignBrackhitUserChoiceModel.query().delete().where(data);
  }

  getUserAgent(data: Partial<CampaignUserAgentModel>) {
    return CampaignUserAgentModel.query().findOne(data);
  }

  insertUserAgent(data: Partial<CampaignUserAgentModel>) {
    return CampaignUserAgentModel.query().insertAndFetch(data);
  }

  insertCampaignLog(data: Partial<CampaignLogsModel>) {
    return CampaignLogsModel.query().insertAndFetch(data);
  }

  insertCampaignLogSlug(data: Partial<CampaignLogSlugModel>) {
    return CampaignLogSlugModel.query().insert(data);
  }

  deleteCampaignLog(data: Partial<CampaignLogsModel>) {
    return CampaignLogsModel.query().delete().where(data);
  }

  getCampaignUserBrackhits(campaignId: number, brackhitId: number) {
    return CampaignUserBrackhitModel.query()
      .alias('cub')
      .leftJoin('labl.campaign as c', 'c.id', 'cub.campaignId')
      .where({
        'c.brackhitId': brackhitId,
        'cub.campaignId': campaignId,
      });
  }

  getCampaignAnalytics(campaignId: number) {
    return CampaignLogsModel.query()
      .select([
        'cl.id',
        `${Relations.UserAgent}.campaignUserId`,
        `${Relations.UserAgent}.ip`,
        `${Relations.UserAgent}.userAgent`,
        `${Relations.UserAgent}.city`,
        `${Relations.UserAgent}.region`,
        `${Relations.UserAgent}.country`,
        `${Relations.UserAgent}:${Relations.User}.email`,
        `${Relations.UserAgent}:${Relations.User}.name`,
        `${Relations.UserAgent}:${Relations.User}.instagramUsername`,
        `${Relations.UserAgent}:${Relations.BrackhitUser}.score`,
        raw('GROUP_CONCAT(a.action_name) as actions'),
        'cl.createdAt',
        'cl.updatedAt',
      ])
      .alias('cl')
      .leftJoinRelated(
        expr(
          [Relations.Action, 'a'],
          [Relations.UserAgent, [Relations.User], [Relations.BrackhitUser]],
        ),
      )
      .where({ 'cl.campaignId': campaignId })
      .whereNotNull(`${Relations.UserAgent}.campaignUserId`)
      .groupBy('cl.userAgentId');
  }

  getLogAction(data: Partial<CampaignLogActionModel>) {
    return CampaignLogActionModel.query().findOne(data);
  }

  getCampaignSlugs(data: Partial<CampaignSlugModel>) {
    return CampaignSlugModel.query().where(data);
  }

  getCampaignSlug(data: Partial<CampaignSlugModel>) {
    return CampaignSlugModel.query().findOne(data);
  }

  insertCampaignSlug(data: Partial<CampaignSlugModel>) {
    return CampaignSlugModel.query().insertAndFetch(data);
  }

  deleteCampaignSlug(data: Partial<CampaignSlugModel>) {
    return CampaignSlugModel.query().delete().where(data);
  }

  findShareSlug(data: Partial<CampaignUserShareSlugsModel>) {
    return CampaignUserShareSlugsModel.query().findOne(data);
  }

  insertSharedBySlug(data: Partial<CampaignUserShareSlugsModel>) {
    return CampaignUserShareSlugsModel.query().insertAndFetch(data);
  }

  insertSharedSlugAction(data: Partial<CampaignLogShareSlugModel>) {
    return CampaignLogShareSlugModel.query().insertAndFetch(data);
  }

  findCustomContentName(data: Partial<CampaignCustomContentNameModel>) {
    return CampaignCustomContentNameModel.query().findOne(data);
  }

  insertCampaignSpotifyScopes(data: Partial<CampaignSpotifyScopesModel>) {
    return CampaignSpotifyScopesModel.query().insertAndFetch(data);
  }

  findCampaignSpotifyScopes(data: Partial<CampaignSpotifyScopesModel>) {
    return CampaignSpotifyScopesModel.query().findOne(data);
  }

  deleteCampaignSpotifyScopes(data: Partial<CampaignSpotifyScopesModel>) {
    return CampaignSpotifyScopesModel.query().delete().where(data);
  }

  findCampaignUserBallot(data: Partial<CampaignUserBallotModel>) {
    return CampaignUserBallotModel.query().findOne(data);
  }

  insertCampaignUserBallot(data: Partial<CampaignUserBallotModel>) {
    return CampaignUserBallotModel.query().insertAndFetch(data);
  }

  insertCampaignQrCode(data: Partial<CompanyQrCodeModel>) {
    return CompanyQrCodeModel.query().insertAndFetch(data);
  }

  findCampaignQrCodes(data: Partial<CompanyQrCodeModel>) {
    return CompanyQrCodeModel.query().where(data);
  }
}
