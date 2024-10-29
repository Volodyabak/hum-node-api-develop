import { Injectable, NotFoundException } from '@nestjs/common';

import { EventsRepository } from '../repositories/events.repository';
import { expr } from '../../../../database/relations/relation-builder';
import { Relations } from '../../../../database/relations/relations';
import { RepositoryService } from '../../repository/services/repository.service';
import { InteractionTypes } from '../../analytics/constants';
import { FeedSources } from '../../feed/constants/feed.constants';
import { ErrorConst } from '../../../constants';
import { EventShowStatus } from '../interfaces/events.interface';
import {
  joinOrderParamsToQueryBuilder,
  joinPaginationParamsToQueryBuilder,
  RestfulQuery,
} from '../../../decorators/restful-query.decorator';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly repoService: RepositoryService,
  ) {}

  async getEvent(userId: string, eventId: number) {
    const eventQB = this.eventsRepository.getEvent({ id: eventId });
    eventQB.withGraphFetched(expr([Relations.TicketmasterVenue], [Relations.Artists]));

    const [event, feedItem] = await Promise.all([
      eventQB,
      this.repoService.feedRepo.findCentralFeedItem({
        sourceId: eventId,
        feedSource: FeedSources.Ticketmaster,
      }),
    ]);

    if (!event) {
      throw new NotFoundException(ErrorConst.EVENT_NOT_FOUND);
    }

    const logItem = await this.repoService.analyticsRepo.findContentLog({
      centralId: feedItem.id,
      userId,
      interactionId: InteractionTypes.Like,
    });

    return {
      event,
      feedItem,
      logItem,
    };
  }

  async getArtistEvents(userId: string, artistId: number, query: RestfulQuery) {
    const artist = await this.repoService.artistRepo.getArtist({ id: artistId });

    if (!artist) {
      throw new NotFoundException(ErrorConst.ARTIST_NOT_FOUND);
    }

    const artistEventsQB = this.eventsRepository
      .getArtistEvents({ artistId })
      .joinRelated(expr([Relations.TicketmasterEvent]))
      .andWhere(function () {
        this.orWhere({ [`${Relations.TicketmasterEvent}.showStatus`]: EventShowStatus.OnSale })
          .orWhere({ [`${Relations.TicketmasterEvent}.showStatus`]: EventShowStatus.Rescheduled })
          .orWhere({ [`${Relations.TicketmasterEvent}.showStatus`]: null });
      });
    const artistEventsCountQB = artistEventsQB.clone().resultSize();

    joinPaginationParamsToQueryBuilder(artistEventsQB, query);

    const [artistEvents, total] = await Promise.all([artistEventsQB, artistEventsCountQB]);
    const eventIds = artistEvents.map((event) => event.eventId);

    const eventsQB = this.eventsRepository
      .getEvents({})
      .withGraphJoined(expr([Relations.TicketmasterVenue], [Relations.Artists]))
      .whereIn(`${Relations.TicketmasterEvent}.id`, eventIds);

    joinOrderParamsToQueryBuilder(eventsQB, query);

    const events = await eventsQB;

    const data = await Promise.all(
      events.map(async (event) => {
        const feedItem = await this.repoService.feedRepo.findCentralFeedItem({
          sourceId: event.id,
          feedSource: FeedSources.Ticketmaster,
        });

        return { event, feedItem };
      }),
    );

    return {
      take: query.paginationParams.take,
      skip: query.paginationParams.skip,
      total: total,
      artist: artist,
      data: data,
    };
  }

  async getEventsRecommendations(userId: string) {
    return Promise.resolve(undefined);
  }
}
