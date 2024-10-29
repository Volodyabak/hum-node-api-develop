import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { RequestAppType } from '../../../constants';
import { CreateBrackhitInput } from '../dto/brackhits.input';
import { BrackhitsService } from '../services/brackhits.service';
import { formatGetBrackhitResponse } from '../utils/brackhits-response.utils';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';

@Controller('v2/brackhits')
@ApiTags('Brackhits v2')
@ApiBearerAuth()
export class BrackhitsV2Controller {
  constructor(private readonly brackhitsService: BrackhitsService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() body: CreateBrackhitInput,
    @ResCtx() ctx: ResponseContext,
  ): Promise<any> {
    const appType = req.headers['x-application-type'] as RequestAppType;

    if (appType && ![RequestAppType.WEB, RequestAppType.APP].includes(appType)) {
      throw new BadRequestException('Invalid application type');
    }

    const brackhit = await this.brackhitsService.createBrackhit(ctx.userId, body, appType);
    const [meta, choices] = await Promise.all([
      this.brackhitsService.getBrackhitMeta(brackhit.brackhitId, ctx.userId, new Date()),
      this.brackhitsService.getBrackhitChoices(brackhit.brackhitId),
    ]);

    return formatGetBrackhitResponse(meta, choices);
  }
}
