import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { nanoid } from 'nanoid';

import { S3Service } from '../../aws/services/s3.service';
import { BrackhitCampaignParams, CampaignDataQueryParamsDto } from '../dto/campaign.dto';
import { DEFAULT_TAKE, ErrorConst } from '../../../constants';
import { RepositoryService } from '../../repository/services/repository.service';
import { BrackhitsService } from '../../brackhits/services/brackhits.service';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';
import { BrackhitsParser } from '../../brackhits/parsers/brackhits-parser';
import {
  BrackhitChoiceWinnerWithPercent,
  BrackhitChoiceWithVotes,
} from '../../brackhits/interfaces/brackhits.interface';
import { BrackhitsCalculationService } from '../../brackhits/services/brackhits-calculation.service';
import { BrackhitsUtils } from '../../brackhits/utils/brackhits.utils';
import { formatAnalyticsData, getImagesKeys } from '../utils/campaign.utils';
import { IpApiService } from './ip-api.service';
import {
  joinOrderParamsToQueryBuilder,
  joinPaginationParamsToQueryBuilder,
  RestfulQuery,
} from '../../../decorators/restful-query.decorator';
import { CreateCampaignSlugDto } from '../dto/create-campaign-slug.dto';
import { BrackhitContentModel } from '@database/Models/Brackhit/BrackhitContentModel';
import { CAMPAIGN_TYPE_ID, CAMPAIGN_TYPE_NAME } from '../constants/campaign.constants';
import { PaginationParams } from '../../../Tools/dto/util-classes';
import { CampaignSearchResponse } from '../dto/campaign.output.dto';
import {
  CampaignBallotModel,
  CampaignBrackhitModel,
  CampaignCustomContentNameModel,
  CampaignLogAction,
  CampaignLogShareSlugModel,
  CampaignLogsModel,
  CampaignModel,
  CampaignSlugModel,
  CampaignUserBrackhitModel,
  CampaignUserShareSlugsModel,
  UserProfileInfoModel,
} from '@database/Models';
import { CreateCampaignInput } from '../dto/input/create-campaign.input';
import { CampaignRepository } from '../../repository/repositories/campaign/campaign.repository';
import { DuplicateCampaignInput } from '../dto/input/duplicate-campaign.input';
import { CompanyRepository } from '../../repository/repositories/company/company.repository';
import { UpdateCampaignInput } from '../dto/input/update-campaign.input';
import { getS3ImagePrefix } from '../../../Tools/utils/image.utils';
import { iterateNestedObject } from '../../../Tools/utils/utils';
import { CreateCampaignBrackhitAnswerKeysInput } from '../dto/input/create-campaign-brackhit-answer-keys.input';
import { BrackhitsServiceExpress } from '../../../Services/Brackhits/BrackhitsServiceExpress';
import { BrackhitAnswerKeyModel } from '@database/Models/Brackhit/BrackhitAnswerKeyModel';
import { LogCampaignActionInput, LogVideoPlayDto } from '../dto/input/log-campaign-action.input';
import { UpdateCampaignChoicesDetailsInput } from '../dto/input/update-campaign-choices-details.input';
import { DeleteCampaignChoicesDetailsInput } from '../dto/input/delete-campaign-choices-details.input';
import { formatDetailsResponse } from '../../ballots/utils/ballot-response.util';
import { QrCodesService } from '../../qr-codes/services/qr-codes.service';
import { PostCampaignQrCodeInput } from '../dto/input/post-campaign-qr-code.input';
import { CampaignTriviaModel } from '@database/Models/trivia/campaign-trivia.model';
import { CampaignGameService } from './campaign-game.service';
import { CampaignUserService } from './campaign-user.service';

@Injectable()
export class CampaignService {
  private campaignRepo: CampaignRepository;
  private companyRepo: CompanyRepository;

  constructor(
    private readonly repoService: RepositoryService,
    private readonly brackhitService: BrackhitsService,
    private readonly brackhitsCalculationService: BrackhitsCalculationService,
    private readonly s3Service: S3Service,
    private readonly ipApiService: IpApiService,
    private readonly qrCodesService: QrCodesService,
    private readonly campaignGameService: CampaignGameService,
    private readonly campaignUserService: CampaignUserService,
  ) {
    this.campaignRepo = repoService.campaign;
    this.companyRepo = repoService.companyRepo;
  }

  async findById(id: number) {
    const campaign = await this.campaignRepo.findCampaign({ id });
    if (!campaign) {
      throw new NotFoundException(ErrorConst.CAMPAIGN_NOT_FOUND);
    }
    return campaign;
  }

  async findCampaign(data: Partial<CampaignModel>) {
    return this.campaignRepo.findCampaign(data);
  }

  async getCampaignById(userId: string, companyId: string, campaignId: number) {
    const [userCompany, campaign] = await Promise.all([
      this.companyRepo.getUserCompany(userId, companyId),
      this.findById(campaignId),
    ]);

    if (!userCompany) {
      throw new BadRequestException(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    await this.joinEntityToCampaign(campaign);
    return campaign;
  }

  async createCampaign(
    userId: string,
    companyId: string,
    body: CreateCampaignInput,
  ): Promise<CampaignModel> {
    const [existingCampaign, userCompany] = await Promise.all([
      this.campaignRepo.findCampaign({ link: body.link }),
      this.companyRepo.getUserCompany(userId, companyId),
    ]);

    if (existingCampaign) {
      throw new BadRequestException(ErrorConst.CAMPAIGN_ALREADY_EXISTS);
    }

    if (!userCompany) {
      throw new BadRequestException(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    const campaign = await this.campaignRepo.insertCampaign({
      companyId,
      typeId: body.typeId,
      name: body.name,
      publicName: body.publicName,
      link: body.link,
      termLink: body.termLink,
      redirectUrl: body.redirectUrl,
      userDetailsPlacement: body.userDetailsPlacement,
      recaptcha: body.recaptcha,
      spotifyAuth: body.spotifyAuth,
      campaignStarttime: body.campaignStarttime,
      campaignEndtime: body.campaignEndtime,
    });

    if (body.spotifyScopes?.length > 0) {
      await this.campaignRepo.insertCampaignSpotifyScopes({
        campaignId: campaign.id,
        scopes: body.spotifyScopes.join(' '),
      });
    }

    return campaign;
  }

  async updateCampaign(
    userId: string,
    companyId: string,
    campaignId: number,
    body: UpdateCampaignInput,
  ): Promise<CampaignModel> {
    // if (!body.brackhitId && !body.ballotId && !body.triviaId) {
    //   throw new BadRequestException(ErrorConst.GAME_ID_IS_REQUIRED);
    // }

    if (body.link) {
      const linkDuplicate = await this.campaignRepo.findCampaign({ link: body.link });

      if (linkDuplicate && linkDuplicate.id !== campaignId) {
        throw new Error(ErrorConst.INTEGRATION_URL_ALREADY_IN_USE);
      }
    }

    const [campaign, userCompany] = await Promise.all([
      this.findById(campaignId),
      this.companyRepo.getUserCompany(userId, companyId),
    ]);

    if (!userCompany) {
      throw new BadRequestException(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    const campaignFolder = `campaigns/${campaign.id}/`;
    const s3Prefix = getS3ImagePrefix();
    const tempPrefix = 'temp/';

    await iterateNestedObject(body.data, async (obj, key) => {
      const value = obj[key];
      if (typeof value === 'string' && value.startsWith(s3Prefix + tempPrefix)) {
        const oldKey = value.replace(s3Prefix, '');
        const newKey = campaignFolder + oldKey.replace(tempPrefix, '');
        try {
          await this.s3Service.copyFile(oldKey, newKey);
          obj[key] = s3Prefix + newKey;
        } catch (err) {
          console.log('Failed to copy file', { value, oldKey, newKey }, err);
        }
      }
    });

    const entityId = body.gameId;
    const dataKey = campaignFolder + 'data.json';
    const data = JSON.stringify(body.data, null, 2);

    await Promise.all([
      this.campaignGameService.linkGameToCampaign(body.campaignType, campaign.id, entityId),
      this.s3Service.putObject(dataKey, {
        Body: data,
        ContentType: 'application/json',
      }),
    ]);

    const updatedCampaign = await campaign.$query().patchAndFetch({
      typeId: CAMPAIGN_TYPE_ID[body.campaignType],
      name: body.name,
      publicName: body.publicName,
      dataKey,
      link: body.link,
      termLink: body.termLink,
      redirectUrl: body.redirectUrl,
      userDetailsPlacement: body.userDetailsPlacement,
      useCustomNames: body.useCustomNames,
      campaignStarttime: body.campaignStarttime,
      campaignEndtime: body.campaignEndtime,
      recaptcha: body.recaptcha,
      spotifyAuth: body.spotifyAuth,
    });
    await this.joinEntityToCampaign(updatedCampaign);

    if (body.spotifyAuth !== 0 && body.spotifyScopes?.length > 0) {
      const campaignScopes = await this.campaignRepo.findCampaignSpotifyScopes({ campaignId });

      if (campaignScopes) {
        await campaignScopes.$query().patchAndFetch({
          scopes: body.spotifyScopes.join(' '),
        });
      } else {
        await this.campaignRepo.insertCampaignSpotifyScopes({
          campaignId,
          scopes: body.spotifyScopes.join(' '),
        });
      }
    }

    if (body.spotifyAuth === 0) {
      await this.campaignRepo.deleteCampaignSpotifyScopes({ campaignId });
    }

    return updatedCampaign;
  }

  async getCampaign(data: CampaignDataQueryParamsDto): Promise<CampaignModel> {
    const campaign = await this.campaignRepo.findCampaign({
      link: data.path,
    });
    if (campaign) {
      await this.joinEntityToCampaign(campaign);
    }
    return campaign;
  }

  async getCampaignBrackhitVotes(data: BrackhitCampaignParams) {
    const [campaign, brackhit] = await Promise.all([
      this.findById(data.campaignId),
      this.repoService.brackhitRepo.getBrackhitById(data.brackhitId),
    ]);

    if (!brackhit) {
      throw new Error(ErrorConst.BRACKHIT_NOT_FOUND);
    }

    const votes = await this.campaignRepo.getCampaignBrackhitVotes(
      data.campaignId,
      data.brackhitId,
    );
    return {
      brackhitId: data.brackhitId,
      votes,
    };
  }

  async createCampaignBrackhitAnswers(
    userId: string,
    campaignId: number,
    brackhitId: number,
    body: CreateCampaignBrackhitAnswerKeysInput,
  ) {
    const [user, campaign, brackhit, userBrackhit] = await Promise.all([
      UserProfileInfoModel.query().findOne({ userId }),
      this.findById(campaignId),
      this.repoService.brackhitRepo.getBrackhitById(brackhitId),
      BrackhitsServiceExpress.getUserBrackhit(userId, brackhitId),
    ]);

    if (!brackhit) {
      throw new Error(ErrorConst.BRACKHIT_NOT_FOUND);
    }

    if (!userBrackhit) {
      await BrackhitsServiceExpress.createUserBrackhit(userId, brackhitId);
    }

    await Promise.all([
      this.campaignGameService.linkGameToCampaign(
        CAMPAIGN_TYPE_NAME.Brackhit,
        campaignId,
        brackhitId,
      ),
      BrackhitAnswerKeyModel.query()
        .insert({
          campaignId,
          brackhitId,
          userId,
        })
        .onConflict(['userId', 'brackhitId'])
        .merge(['userId', 'brackhitId']),
    ]);

    const answers = await Promise.all(
      body.choices.map((choice) =>
        BrackhitsServiceExpress.updateBrackhitChoice({
          userId,
          brackhitId,
          roundId: choice.roundId,
          choiceId: choice.choiceId,
        }),
      ),
    );

    return { user, answers };
  }

  async logCampaignAction(
    body: LogCampaignActionInput,
    campaignId: number,
    ip: string,
    userAgent: string,
  ): Promise<CampaignLogsModel> {
    const promises = await Promise.all([
      this.campaignRepo.getLogAction({ actionName: body.action }),
      this.campaignRepo.getCampaignSlug({ campaignId, slug: body.slug || null }),
      this.campaignRepo.findCampaignUser({ userId: body.userId }),
      this.campaignRepo.getUserAgent({ ip, userAgent }),
    ]);

    const [campaignAction, campaignSlug, campaignUser] = promises;
    let campaignUserAgent = promises[3];

    if (!campaignAction) {
      throw new Error(ErrorConst.UNKNOWN_ACTION);
    }

    if (campaignSlug && campaignUser) {
      await this.campaignRepo.insertCampaignLogSlug({
        campaignId,
        slugId: campaignSlug.id,
        userId: campaignUser.userId,
      });
    }

    if (!campaignUserAgent) {
      const ipInfo = await this.ipApiService.getIpInfo(ip);
      campaignUserAgent = await this.campaignRepo.insertUserAgent({
        ip: ip,
        campaignUserId: campaignUser?.userId,
        userAgent: userAgent,
        city: ipInfo.city,
        region: ipInfo.region,
        country: ipInfo.country,
        latitude: ipInfo.lat,
        longitude: ipInfo.lon,
      });

      if (campaignUser) {
        await this.campaignUserService.createCampaignUserData(campaignId, campaignUser.userId, {
          country: ipInfo.country,
          region: ipInfo.region,
          city: ipInfo.city,
        });
      }
    }

    if (!campaignUserAgent.campaignUserId && campaignUser) {
      await Promise.all([
        campaignUserAgent.$query().patchAndFetch({ campaignUserId: campaignUser.userId }),
        this.campaignUserService.createCampaignUserData(campaignId, campaignUser.userId, {
          country: campaignUserAgent.country,
          region: campaignUserAgent.region,
          city: campaignUserAgent.city,
        }),
      ]);
    }

    const data = {
      userAgentId: campaignUserAgent.id,
      campaignId: campaignId,
      actionId: campaignAction.id,
      slugId: campaignSlug?.id,
      url: body?.url,
    };

    if (body.action === CampaignLogAction.CONTENT_PLAY) {
      const playData = body.data as LogVideoPlayDto;
      data['choiceId'] = playData.choiceId;
      data['playtime'] = playData.playTime;
    }

    return this.campaignRepo.insertCampaignLog(data);
  }

  async deleteCampaign(userId: string, companyId: string, campaignId: number) {
    const [userCampaign, campaign] = await Promise.all([
      this.companyRepo.getUserCompany(userId, companyId),
      this.campaignRepo.findCampaign({ id: campaignId, companyId }),
    ]);

    if (!userCampaign) {
      throw new Error('User does not belongs to company');
    }

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return Promise.all([
      CampaignUserBrackhitModel.query().delete().where({ campaignId }),
      this.campaignRepo.deleteCampaignLog({ campaignId }),
      this.campaignRepo.deleteCampaign(campaignId),
      this.s3Service.deleteFolder(`campaigns/${campaignId}`),
    ]);
  }

  async getCampaignBrackhitMaster(campaignId: number, brackhitId: number) {
    const [completions, votes, winners] = await Promise.all([
      this.getCampaignBrackhitCompletions(campaignId, brackhitId),
      this.campaignRepo.getCampaignBrackhitVotes(campaignId, brackhitId),
      this.getCampaignBrackhitWinners(campaignId, brackhitId),
    ]);

    // todo: refactor this
    const fullVotes = await Promise.all(
      votes.map(async (el: any) => {
        const brackhitContent = await BrackhitContentModel.query()
          .findOne({ choiceId: el.choiceId })
          .withGraphJoined(expr([Relations.Track, [Relations.Artists]]));

        return {
          ...el,
          brackhitContent,
        };
      }),
    );

    return {
      campaignId,
      brackhitId,
      completions,
      results: fullVotes.map((el) => BrackhitsParser.parseCampaignBrackhitMeta(el)),
      winners: winners.map((el) => BrackhitsParser.parseCampaignBrackhitWinners(el)),
    };
  }

  async getCampaignBrackhitWinners(
    campaignId: number,
    brackhitId: number,
  ): Promise<BrackhitChoiceWinnerWithPercent[]> {
    const brackhit = await this.repoService.brackhitRepo
      .getBrackhitById(brackhitId)
      .withGraphFetched(expr([Relations.Matchups]));

    const votes = await this.campaignRepo
      .getCampaignBrackhitVotes(campaignId, brackhitId)
      .orderBy('roundId')
      .orderBy('votes', 'desc')
      .castTo<BrackhitChoiceWithVotes[]>();

    // todo: refactor this
    const fullVotes = await Promise.all(
      votes.map(async (el: any) => {
        const brackhitContent = await BrackhitContentModel.query()
          .findOne({ choiceId: el.choiceId })
          .withGraphJoined(expr([Relations.Track, [Relations.Artists]]));

        return {
          ...el,
          brackhitContent,
        };
      }),
    );

    const winners = await this.brackhitsCalculationService.calculateBrackhitWinnersFromVotes(
      brackhit,
      fullVotes,
    );

    return BrackhitsUtils.getBrackhitWinnersWithPercent(brackhit, brackhit.matchups, winners);
  }

  async getCampaignBrackhitCompletions(campaignId: number, brackhitId: number) {
    const completions = await this.campaignRepo
      .getCampaignUserBrackhits(campaignId, brackhitId)
      .sum('cub.completions as totalCompletions')
      .groupBy('cub.campaignId', 'c.brackhitId')
      .first();

    return completions?.totalCompletions || 0;
  }

  async getCampaignAnalytics(campaignId: number, query: RestfulQuery) {
    const analyticsQB = this.campaignRepo.getCampaignAnalytics(campaignId);
    const totalQB = analyticsQB.clone().resultSize();

    joinPaginationParamsToQueryBuilder(analyticsQB, query);
    joinOrderParamsToQueryBuilder(analyticsQB, query);

    const [data, total] = await Promise.all([analyticsQB, totalQB]);
    formatAnalyticsData(data);

    return {
      data: data,
      pagination: {
        total: total,
        skip: query.paginationParams.skip,
        take: query.paginationParams.take,
      },
    };
  }

  async downloadAnalyticsReport(campaignId: number) {
    const data = await this.campaignRepo.getCampaignAnalytics(campaignId);
    formatAnalyticsData(data);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Analytics');

    const headerKeys = [
      'name',
      'email',
      'instagramUsername',
      'time',
      'actions',
      'location',
      'device',
    ];
    const headerRow = worksheet.addRow(headerKeys);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'cccccc' },
    };

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Instagram', key: 'instagramUsername', width: 25 },
      { header: 'Time', key: 'time', width: 25 },
      { header: 'Logged Action', key: 'actions', width: 25 },
      { header: 'Location', key: 'location', width: 25 },
      { header: 'Device', key: 'device', width: 25 },
    ];

    worksheet.addRows(data);

    return workbook;
  }

  async getCampaignSlugs(campaignId: number): Promise<CampaignSlugModel[]> {
    return this.campaignRepo.getCampaignSlugs({ campaignId });
  }

  async createCampaignSlug(
    campaignId: number,
    body: CreateCampaignSlugDto,
  ): Promise<CampaignSlugModel> {
    return this.campaignRepo.insertCampaignSlug({
      campaignId,
      slug: nanoid(6),
      ...body,
    });
  }

  async deleteCampaignSlug(slugId: number) {
    const campaignSlug = await this.campaignRepo.getCampaignSlug({ id: slugId });

    if (!campaignSlug) {
      throw new Error(ErrorConst.CAMPAIGN_SLUG_NOT_FOUND);
    }

    return this.campaignRepo.deleteCampaignSlug({ id: slugId });
  }

  async createSharedBySlug(
    userId: string,
    campaignId: number,
    slug: string,
  ): Promise<CampaignUserShareSlugsModel> {
    const [user, campaign] = await Promise.all([
      this.campaignRepo.findCampaignUser({ userId }),
      this.findById(campaignId),
    ]);

    if (!user) {
      throw new Error(ErrorConst.USER_DOES_NOT_EXIST);
    }

    return this.campaignRepo.insertSharedBySlug({
      campaignId,
      userId,
      slug,
    });
  }

  async logSharedByAction(
    userId: string,
    campaignId: number,
    slug: string,
  ): Promise<CampaignLogShareSlugModel> {
    const [user, campaign, shareSlug] = await Promise.all([
      this.campaignRepo.findCampaignUser({ userId }),
      this.findById(campaignId),
      this.campaignRepo.findShareSlug({ campaignId, slug }),
    ]);

    if (!user) {
      throw new Error(ErrorConst.USER_DOES_NOT_EXIST);
    }

    if (!shareSlug) {
      throw new Error(ErrorConst.SHARE_SLUG_NOT_FOUND);
    }

    return this.campaignRepo.insertSharedSlugAction({
      userId,
      campaignId,
      shareSlugId: shareSlug.id,
    });
  }

  async getCampaignChoicesWithNames(campaignId: number, brackhitId: number) {
    const [choices, campaignBrackhit] = await Promise.all([
      this.brackhitService.getBrackhitChoices(brackhitId),
      this.campaignRepo.findCampaignBrackhit({ campaignId, brackhitId }),
    ]);

    if (!campaignBrackhit) {
      throw new Error(ErrorConst.BRACKHIT_DOES_NOT_BELONGS_TO_CAMPAIGN);
    }

    await Promise.all(
      choices.map(async (choice) => {
        const content = await this.campaignRepo.findCustomContentName({
          campaignId,
          choiceId: choice.choiceId,
        });
        if (choice?.content) {
          choice.content['details'] = formatDetailsResponse(content);
        }
      }),
    );

    return choices;
  }

  async getCampaigns(
    userId: string,
    companyId: string,
    query: PaginationParams,
  ): Promise<CampaignSearchResponse> {
    const userCompany = await this.repoService.companyRepo.getUserCompany(userId, companyId);

    if (!userCompany) {
      throw new BadRequestException(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    const campaignsQB = this.campaignRepo
      .findCampaigns({
        companyId,
      })
      .withGraphFetched(expr([Relations.Slugs]))
      .orderBy('createdAt', 'desc')
      .offset(query.skip || 0)
      .limit(query.take || DEFAULT_TAKE);
    const totalQB = campaignsQB.clone().resultSize();

    const [data, total] = await Promise.all([campaignsQB, totalQB]);

    return {
      data: data,
      pagination: {
        total: total,
        skip: query.skip,
        take: query.take,
      },
    };
  }

  async duplicate(
    userId: string,
    companyId: string,
    campaignId: number,
    body: DuplicateCampaignInput,
  ) {
    const [campaign, existingCampaign, userCompany] = await Promise.all([
      this.campaignRepo.findCampaign({ id: campaignId }),
      this.campaignRepo.findCampaign({ link: body.link }),
      this.repoService.companyRepo.getUserCompany(userId, companyId),
    ]);

    if (!userCompany) {
      throw new BadRequestException(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    if (!campaign) {
      throw new NotFoundException(ErrorConst.CAMPAIGN_NOT_FOUND);
    }

    if (existingCampaign) {
      throw new BadRequestException(ErrorConst.CAMPAIGN_ALREADY_EXISTS);
    }

    const { id, createdAt, updatedAt, data: oldData, ...rest } = campaign;
    const newCampaign = await this.campaignRepo.insertCampaign({
      ...rest,
      companyId,
      name: body.name,
      link: body.link,
    });

    const data = campaign.data || {};
    const dataKey = `campaigns/${newCampaign.id}/data.json`;

    if (campaign.data) {
      const keys = getImagesKeys(campaignId, newCampaign.id, data);

      await Promise.all(
        keys.map(async ({ oldKey, newKey }) => {
          try {
            await this.s3Service.copyFile(oldKey, newKey);
          } catch (err) {
            console.log('Failed to copy file', { oldKey, newKey }, err);
          }
        }),
      );
    }

    let content: CampaignBrackhitModel | CampaignBallotModel | CampaignTriviaModel;
    if (campaign.typeId === CAMPAIGN_TYPE_ID.Brackhit) {
      content = await this.campaignRepo.findCampaignBrackhit({ campaignId });
      await this.campaignGameService.linkGameToCampaign(
        CAMPAIGN_TYPE_NAME.Brackhit,
        newCampaign.id,
        content.brackhitId,
      );
    } else if (campaign.typeId === CAMPAIGN_TYPE_ID.Ballot) {
      content = await this.campaignRepo.findCampaignBallot({ campaignId });
      await this.campaignGameService.linkGameToCampaign(
        CAMPAIGN_TYPE_NAME.Ballot,
        newCampaign.id,
        content.ballotId,
      );
    } else if (campaign.typeId === CAMPAIGN_TYPE_ID.Trivia) {
      content = await this.repoService.trivia.findCampaignTrivia({ campaignId });
      await this.campaignGameService.linkGameToCampaign(
        CAMPAIGN_TYPE_NAME.Trivia,
        newCampaign.id,
        content.triviaId,
      );
    }

    await this.s3Service.putObject(dataKey, {
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });

    const updatedCampaign = await newCampaign.$query().patchAndFetch({ dataKey });
    await this.joinEntityToCampaign(updatedCampaign);

    return updatedCampaign;
  }

  async joinEntityToCampaign(campaign: CampaignModel) {
    if (campaign.typeId === CAMPAIGN_TYPE_ID.Brackhit) {
      const campaignBrackhit = await this.campaignRepo
        .findCampaignBrackhit({ campaignId: campaign.id })
        .withGraphFetched(expr([Relations.Brackhit]));
      campaign['brackhit'] = campaignBrackhit?.brackhit;
    } else if (campaign.typeId === CAMPAIGN_TYPE_ID.Ballot) {
      const campaignBallot = await this.campaignRepo
        .findCampaignBallot({ campaignId: campaign.id })
        .withGraphFetched(expr([Relations.Ballot]));
      campaign['ballot'] = campaignBallot?.ballot;
    } else if (campaign.typeId === CAMPAIGN_TYPE_ID.Trivia) {
      const campaignTrivia = await this.repoService.trivia
        .findCampaignTrivia({ campaignId: campaign.id })
        .withGraphFetched(expr([Relations.Trivia]));
      campaign['trivia'] = campaignTrivia?.trivia;
    }
  }

  async getCampaignChoiceDetails(campaignId: number) {
    const campaign = await this.findById(campaignId);
    return CampaignCustomContentNameModel.query().where({ campaignId: campaign.id });
  }

  async updateCampaignChoiceDetails(
    userId: string,
    companyId: string,
    campaignId: number,
    body: UpdateCampaignChoicesDetailsInput,
  ) {
    const [campaign, userCompany] = await Promise.all([
      this.findById(campaignId),
      this.companyRepo.getUserCompany(userId, companyId),
    ]);

    if (!userCompany) {
      throw new BadRequestException(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    await campaign.$query().patch({ useCustomNames: 1 });

    return Promise.all(
      body.choices.map(async (choice) => {
        const choiceDetails = await CampaignCustomContentNameModel.query().findOne({
          campaignId,
          choiceId: choice.choiceId,
        });

        if (choiceDetails) {
          return choiceDetails.$query().patchAndFetch(choice);
        }

        return CampaignCustomContentNameModel.query().insertAndFetch({
          campaignId,
          ...choice,
        });
      }),
    );
  }

  async deleteCampaignChoiceDetails(
    userId: string,
    companyId: string,
    campaignId: number,
    body: DeleteCampaignChoicesDetailsInput,
  ) {
    await this.findUserCampaign(userId, companyId, campaignId);

    return Promise.all(
      body.choices.map((choice) =>
        CampaignCustomContentNameModel.query().delete().where({
          campaignId,
          choiceId: choice.choiceId,
        }),
      ),
    );
  }

  async deleteCampaignFile(userId: string, companyId: string, campaignId: number, link: string) {
    const { campaign } = await this.findUserCampaign(userId, companyId, campaignId);
    let stringData = JSON.stringify(campaign.data, null, 2);

    if (link.includes('campaigns/')) {
      if (!stringData.includes(link)) {
        throw new BadRequestException(ErrorConst.FILE_DOES_NOT_BELONGS_TO_CAMPAIGN);
      }
    }

    const key = link.replace(getS3ImagePrefix(), '');
    await this.s3Service.deleteObject(key);

    if (stringData) {
      stringData = stringData.replace(link, '');

      await this.s3Service.putObject(`campaigns/${campaignId}/data.json`, {
        Body: stringData,
        ContentType: 'application/json',
      });
    }

    return { success: true };
  }

  private async findUserCampaign(userId: string, companyId: string, campaignId: number) {
    const [campaign, userCompany] = await Promise.all([
      this.findById(campaignId),
      this.companyRepo.getUserCompany(userId, companyId),
    ]);

    if (!userCompany) {
      throw new BadRequestException(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    return { campaign, userCompany };
  }

  async createQrCode(
    userId: string,
    campaignId: number,
    companyId: string,
    body: PostCampaignQrCodeInput,
  ) {
    const [campaign, userCompany] = await Promise.all([
      this.findById(campaignId),
      this.companyRepo
        .getUserCompany(userId, companyId)
        .withGraphFetched(expr([Relations.Company])),
    ]);

    const slug = await this.createCampaignSlug(campaignId, { name: body.name });
    const url = `${process.env.FRONTEND_URL}/campaign/${campaign.link}?si=${slug.slug}`;

    const qrCode = await this.qrCodesService.create(body.name, url, {
      type: 'image/webp',
      width: 300,
    });

    await this.campaignRepo.insertCampaignQrCode({
      qrCodeId: qrCode.id,
      companyId: userCompany.company.id,
    });

    return qrCode;
  }

  async getQrCodes(userId: string, campaignId: number, companyId: string) {
    const userCompany = await this.companyRepo
      .getUserCompany(userId, companyId)
      .withGraphFetched(expr([Relations.Company]));

    if (!userCompany) {
      throw new NotFoundException(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    const campaignQrCodes = await this.campaignRepo
      .findCampaignQrCodes({ companyId: userCompany.company.id })
      .withGraphFetched(expr([Relations.QrCode]));

    return campaignQrCodes.map((campaignQrCode) => campaignQrCode.qrCode);
  }
}
