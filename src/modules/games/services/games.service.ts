import { Injectable } from '@nestjs/common';
import { ChoiceDto } from '../../../common/dto/games/choice.input.dto';
import { BrackhitContentTypeId } from '@database/Models/BrackhitContentTypeModel';
import { BrackhitContentType } from '../../brackhits/constants/brackhits.constants';
import { TrackInfoDto } from '../../tracks/tracks.dto';
import { RepositoryService } from '../../repository/services/repository.service';
import { BrackhitsContentService } from '../../brackhits-content/services/brackhits-content.service';
import { Choice } from '@database/mongodb/games/common';

@Injectable()
export class GamesService {
  constructor(
    private readonly repoService: RepositoryService,
    private readonly contentService: BrackhitsContentService,
  ) {}

  async saveChoices(choices: ChoiceDto[]): Promise<Choice[]> {
    return await Promise.all(
      choices.map(async (choice) => {
        const dbChoice = await this.saveChoice(choice);
        return {
          type: choice.type,
          choiceId: dbChoice.choiceId,
          contentId: dbChoice.contentId,
          isCorrect: choice.isCorrect,
        };
      }),
    );
  }

  async populateChoiceContent(choice: Choice) {
    if (choice.type === BrackhitContentType.Custom) {
      return this.contentService.getCustomContent({ id: choice.contentId });
    } else {
      return this.contentService.getContent(choice.contentId, choice.type);
    }
  }

  private async saveChoice(choice: ChoiceDto) {
    const content = await this.getOrCreateContent(choice);
    return this.repoService.brackhitRepo.findOrCreateBrackhitChoice({
      contentId: content.id,
      contentTypeId: BrackhitContentTypeId[choice.type],
    });
  }

  private async getOrCreateContent(choice: ChoiceDto) {
    if (choice.type === BrackhitContentType.Custom) {
      return await this.getOrCreateCustomContent(choice);
    }
    return await this.getOrCreateStandardContent(choice);
  }

  private async getOrCreateCustomContent(choice: ChoiceDto) {
    let content = await this.contentService.getCustomContent({
      name: choice.name,
      thumbnail: choice.thumbnail,
      contentUrl: choice.contentUrl,
    });

    if (!content) {
      content = await this.contentService.saveCustomContent(choice);
    }

    return content;
  }

  private async getOrCreateStandardContent(choice: ChoiceDto) {
    let content = await this.contentService.getContent(choice.id, choice.type);

    const isYoutube = choice.type === BrackhitContentType.Youtube;
    const isTrack = choice.type === BrackhitContentType.Track;
    const isTrackWithoutPreview = isTrack && !(content as TrackInfoDto)?.preview;

    if (!content || isYoutube || isTrackWithoutPreview) {
      content = await this.contentService.saveContent(choice.id, choice.type, choice.data);
    }

    return content;
  }
}
