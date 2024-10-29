import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EventsService } from '../services/events.service';
import { EventIdParam } from '../dto/events.common.dto';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { ArtistIdParamDto } from '../../../Tools/dto/main-api.dto';
import { formatEvent } from '../utils/format.utils';
import { GetEventOutput } from '../dto/output/get-event.output.dto';
import { GetArtistEventsOutput } from '../dto/output/get-artist-events.output.dto';
import { RestfulQuery, RestQuery } from '../../../decorators/restful-query.decorator';
import { EventRestQueryColumns } from '../dto/input/get-artist-events.input.dto';

@Controller('events')
@ApiTags('Events')
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('recommendations')
  async getEventsRecommendations(@ResCtx() ctx: ResponseContext) {
    return this.eventsService.getEventsRecommendations(ctx.userId);
  }

  @Get('artists/:artistId')
  @ApiOperation({
    summary: 'Get artist events',
    description: 'Get artist events by artist id',
  })
  @ApiQuery({ name: 'take', type: Number, required: false })
  @ApiQuery({ name: 'skip', type: Number, required: false })
  @ApiQuery({ name: 'order_by', type: String, required: false })
  @ApiResponse({ status: 200, type: GetArtistEventsOutput })
  async getArtistEvents(
    @Param() params: ArtistIdParamDto,
    @ResCtx() ctx: ResponseContext,
    @RestQuery(EventRestQueryColumns) restQuery: RestfulQuery,
  ): Promise<GetArtistEventsOutput> {
    const result = await this.eventsService.getArtistEvents(ctx.userId, params.artistId, restQuery);
    const data = result.data.map(({ event, feedItem }) => {
      return {
        centralId: feedItem.id,
        event: formatEvent(event),
      };
    });

    return {
      id: result.artist.id,
      name: result.artist.facebookName,
      data,
      pagination: {
        take: result.take,
        skip: result.skip,
        total: result.total,
      },
    };
  }

  @Get(':eventId')
  @ApiOperation({
    summary: 'Get event',
    description: 'Get event by id',
  })
  @ApiResponse({ status: 200, type: GetEventOutput })
  async getEvent(
    @Param() params: EventIdParam,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetEventOutput> {
    const { event, feedItem, logItem } = await this.eventsService.getEvent(
      ctx.userId,
      params.eventId,
    );

    return {
      event: formatEvent(event),
      centralId: feedItem.id,
      liked: !!logItem,
    };
  }
}
