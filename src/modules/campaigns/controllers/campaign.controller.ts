import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CompanyIdDto } from '../../companies/dto/companies.dto';
import { CampaignService } from '../services/campaign.service';
import {
  CampaignDataQueryParamsDto,
  CampaignIdDto,
  BrackhitCampaignParams,
  GetChoicesWithNamesParamsDto,
  ShareSlugDto,
  CampaignUserDto,
} from '../dto/campaign.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { PaginationQueryDto } from '../../../Tools/dto/main-api.dto';
import { RestfulQuery, RestQuery } from '../../../decorators/restful-query.decorator';
import {
  CampaignCustomContentNameModel,
  CampaignLogShareSlugModel,
  CampaignLogsModel,
  CampaignModel,
  CampaignSlugModel,
  CampaignUserShareSlugsModel,
} from '@database/Models';
import { getIp } from '../../../Tools/utils/utils';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CampaignSubmitService } from '../services/campaign-submit.service';
import { CampaignUserService } from '../services/campaign-user.service';
import {
  CreateCampaignSlugDto,
  CampaignSlugIdParam,
  CampaignSearchResponse,
  CreateCampaignInput,
  DuplicateCampaignInput,
  UpdateCampaignInput,
  CreateCampaignBrackhitAnswerKeysInput,
  LogCampaignActionInput,
  UpdateCampaignChoicesDetailsInput,
  DeleteCampaignChoicesDetailsInput,
  DeleteCampaignFileQueryInput,
  PostCampaignQrCodeInput,
  SubmitCampaignInput,
  SubmitCampaignResponse,
} from '../dto';
import { SyncService } from '../../sync-bridge/services/sync-bridge.service';

@Controller('campaigns')
@ApiTags('Campaigns')
@ApiBearerAuth()
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly campaignUserService: CampaignUserService,
    private readonly campaignSubmitService: CampaignSubmitService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Return campaign with specified path' })
  @ApiResponse({ type: CampaignModel })
  async getCampaignData(@Query() query: CampaignDataQueryParamsDto) {
    return this.campaignService.getCampaign(query);
  }

  @Post('/')
  @ApiOperation({ summary: 'Creates campaign' })
  @ApiResponse({ type: CampaignModel })
  async createCampaign(
    @Body() body: CreateCampaignInput,
    @Query() query: CompanyIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.createCampaign(ctx.userId, query.companyId, body);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Returns user campaigns' })
  @ApiResponse({ type: CampaignSearchResponse })
  async getCampaigns(
    @Query() query: CompanyIdDto,
    @Query() pagination: PaginationQueryDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.getCampaigns(ctx.userId, query.companyId, pagination);
  }

  @Post('/sync/:id/:service')
  async syncCampaign(
    @Param('id') id: number,
    @Param('service') service: SyncService,
    @Body('listId') listId: string,
    @Query() query: CompanyIdDto,
  ) {
    const campaign = await this.campaignService.findCampaign({ id, companyId: query.companyId });
    if (!campaign) {
      throw new NotFoundException('Campaign not found or not belongs to company');
    }

    return this.campaignUserService.syncUserData(id, service, listId);
  }

  @Post('/:campaignId/submit')
  @ApiOperation({ summary: 'Submit campaign user choices' })
  @ApiResponse({ type: SubmitCampaignResponse })
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
      generateKey: (req) => getIp(req.switchToHttp().getRequest()),
    },
  })
  @UseGuards(ThrottlerGuard)
  async submitCampaign(
    @Req() req: Request,
    @Param() param: CampaignIdDto,
    @Body() body: SubmitCampaignInput,
  ) {
    return this.campaignSubmitService.submit(param.campaignId, body);
  }

  @Post('/:campaignId/duplicate')
  @ApiOperation({ summary: 'Duplicate campaign' })
  @ApiResponse({ type: CampaignModel })
  async duplicateCampaign(
    @Param() param: CampaignIdDto,
    @Body() body: DuplicateCampaignInput,
    @Query() query: CompanyIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.duplicate(ctx.userId, query.companyId, param.campaignId, body);
  }

  @Get('/:campaignId/brackhits/:brackhitId/votes')
  @ApiOperation({ summary: 'Returns votes for campaign brackhit' })
  async getCampaignBrackhitVotes(@Param() params: BrackhitCampaignParams) {
    return this.campaignService.getCampaignBrackhitVotes(params);
  }

  @Post('/:campaignId/brackhits/:brackhitId/answers')
  @ApiOperation({ summary: 'Returns votes for campaign brackhit' })
  async createCampaignBrackhitAnswers(
    @Param() params: BrackhitCampaignParams,
    @Body() body: CreateCampaignBrackhitAnswerKeysInput,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.createCampaignBrackhitAnswers(
      ctx.userId,
      params.campaignId,
      params.brackhitId,
      body,
    );
  }

  @Get('/:campaignId/brackhits/:brackhitId/master')
  @ApiOperation({ summary: 'Returns master brackhit for campaign' })
  async getCampaignBrackhitMaster(@Param() params: BrackhitCampaignParams) {
    // todo: check response (completions won't be shown correctly)
    return this.campaignService.getCampaignBrackhitMaster(params.campaignId, params.brackhitId);
  }

  @Get('/:campaignId/analytics')
  @ApiOperation({ summary: 'Returns campaign analytics' })
  async getCampaignAnalytics(
    @Param() param: CampaignIdDto,
    @Query() query: PaginationQueryDto,
    @RestQuery({ score: 'cub.score', createdAt: 'cl.createdAt' }) restQuery: RestfulQuery,
  ) {
    return this.campaignService.getCampaignAnalytics(param.campaignId, restQuery);
  }

  @Get('/:campaignId/analytics/download')
  @ApiOperation({ summary: 'Download spreadsheet with campaign analytics' })
  async downloadAnalyticsReport(@Param() param: CampaignIdDto, @Res() res: Response) {
    const workbook = await this.campaignService.downloadAnalyticsReport(param.campaignId);
    const filename = 'campaign_analytics.csv';

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'text/csv');

    await workbook.csv.write(res);
    res.end();
  }

  @Post('/:campaignId/log')
  @ApiOperation({ summary: 'Logs user action for specified campaign' })
  @ApiResponse({ type: CampaignLogsModel })
  async logCampaignAction(
    @Req() req: Request,
    @Param() param: CampaignIdDto,
    @Body() body: LogCampaignActionInput,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip = getIp(req);

    return this.campaignService.logCampaignAction(body, param.campaignId, ip, userAgent);
  }

  @Post('/:campaignId/share-slugs')
  @ApiOperation({ summary: 'Creates slug for campaign' })
  @ApiResponse({ type: CampaignUserShareSlugsModel })
  async createSharedBySlug(@Param() param: CampaignIdDto, @Body() body: ShareSlugDto) {
    return this.campaignService.createSharedBySlug(body.userId, param.campaignId, body.slug);
  }

  @Post('/:campaignId/share-slugs/log')
  @ApiOperation({ summary: 'Logs user action for specified slug' })
  @ApiResponse({ type: CampaignLogShareSlugModel })
  async logSharedByAction(@Param() param: CampaignIdDto, @Body() body: ShareSlugDto) {
    return this.campaignService.logSharedByAction(body.userId, param.campaignId, body.slug);
  }

  @Get('/:campaignId')
  async getCampaign(
    @Param() param: CampaignIdDto,
    @Query() query: CompanyIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.getCampaignById(ctx.userId, query.companyId, param.campaignId);
  }

  @Put('/:campaignId')
  @ApiOperation({ summary: 'Updates campaign data' })
  @ApiResponse({ type: CampaignModel })
  async updateCampaignData(
    @Param() param: CampaignIdDto,
    @Body() body: UpdateCampaignInput,
    @Query() query: CompanyIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.updateCampaign(ctx.userId, query.companyId, param.campaignId, body);
  }

  @Delete('/:campaignId')
  @ApiOperation({ summary: 'Deletes campaign' })
  async deleteCampaign(
    @Param() param: CampaignIdDto,
    @Query() query: CompanyIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.deleteCampaign(ctx.userId, query.companyId, param.campaignId);
  }

  @Post('/:campaignId/user')
  async createCampaignUser(@Param() param: CampaignIdDto, @Body() body: CampaignUserDto) {
    const campaignUser = await this.campaignUserService.findOrCreateCampaignUser(
      param.campaignId,
      body,
    );
    await this.campaignUserService.linkUserToCampaign(param.campaignId, campaignUser.userId);
    return campaignUser;
  }

  @Get('/:campaignId/slugs')
  @ApiOperation({ summary: 'Returns all campaign slugs' })
  @ApiResponse({ type: CampaignSlugModel, isArray: true })
  async getCampaignSlugs(@Param() param: CampaignIdDto) {
    return this.campaignService.getCampaignSlugs(param.campaignId);
  }

  @Get('/:campaignId/choice-details')
  @ApiOperation({ summary: 'Get campaign content custom details' })
  @ApiResponse({ type: CampaignCustomContentNameModel })
  async getCampaignChoiceDetails(@Param() param: CampaignIdDto) {
    return this.campaignService.getCampaignChoiceDetails(param.campaignId);
  }

  @Put('/:campaignId/choice-details')
  @ApiOperation({ summary: 'Updates campaign content custom details' })
  @ApiResponse({ type: CampaignCustomContentNameModel })
  async postCampaignChoiceDetails(
    @Param() param: CampaignIdDto,
    @Body() body: UpdateCampaignChoicesDetailsInput,
    @Query() query: CompanyIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.updateCampaignChoiceDetails(
      ctx.userId,
      query.companyId,
      param.campaignId,
      body,
    );
  }

  @Delete('/:campaignId/choice-details')
  @ApiOperation({ summary: 'Delete campaign content custom details' })
  @ApiResponse({ type: CampaignCustomContentNameModel })
  async deleteCampaignChoiceDetails(
    @Param() param: CampaignIdDto,
    @Body() body: DeleteCampaignChoicesDetailsInput,
    @Query() query: CompanyIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.deleteCampaignChoiceDetails(
      ctx.userId,
      query.companyId,
      param.campaignId,
      body,
    );
  }

  @Delete('/:campaignId/delete-file')
  async deleteCampaignFile(
    @Param() param: CampaignIdDto,
    @Query() query: DeleteCampaignFileQueryInput,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.deleteCampaignFile(
      ctx.userId,
      query.companyId,
      param.campaignId,
      query.link,
    );
  }

  @Get('/:campaignId/brackhits/:brackhitId/choices')
  @ApiOperation({ summary: 'Returns campaign brackhit choices with custom names' })
  async getCampaignChoicesWithNames(@Param() params: GetChoicesWithNamesParamsDto) {
    return this.campaignService.getCampaignChoicesWithNames(params.campaignId, params.brackhitId);
  }

  @Post('/:campaignId/slugs')
  @ApiOperation({ summary: 'Creates campaign slug' })
  @ApiResponse({ type: CampaignSlugModel })
  async createCampaignSlug(@Param() param: CampaignIdDto, @Body() body: CreateCampaignSlugDto) {
    return this.campaignService.createCampaignSlug(param.campaignId, body);
  }

  @Delete('/:campaignId/slugs/:slugId')
  @ApiOperation({ summary: 'Deletes campaign slug' })
  async deleteCampaignSlug(@Param() param: CampaignSlugIdParam) {
    return this.campaignService.deleteCampaignSlug(param.slugId);
  }

  @Get('/:campaignId/qr-codes')
  async getQrCodes(
    @Param() param: CampaignIdDto,
    @Query() query: CompanyIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.getQrCodes(ctx.userId, param.campaignId, query.companyId);
  }

  @Post('/:campaignId/qr-codes')
  async createQrCode(
    @Param() param: CampaignIdDto,
    @Body() body: PostCampaignQrCodeInput,
    @Query() query: CompanyIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.campaignService.createQrCode(ctx.userId, param.campaignId, query.companyId, body);
  }
}
