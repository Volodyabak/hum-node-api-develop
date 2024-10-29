import { Injectable } from '@nestjs/common';
import {
  ArtistCategoriesModel,
  ArtistCategoryModel,
  ArtistHomeModel,
  ArtistModel,
  ArtistScoresModel,
  UserFeedPreferencesModel,
} from '../../../../../database/Models';
import { ArtistRepository } from './artist.repository';
import { ConstantId } from '../../../constants/constants';
import { ConstantsRepository } from '../../../constants/repository/constants.repository';
import { expr } from '../../../../../database/relations/relation-builder';
import { Relations } from '../../../../../database/relations/relations';

@Injectable()
export class ArtistHomeRepository {
  constructor(
    private readonly artistRepository: ArtistRepository,
    private readonly constantsRepo: ConstantsRepository,
  ) {}

  getArtistHome() {
    return ArtistHomeModel.query().alias('ah').findOne('ah.name', 'Home');
  }

  getArtistCategories(categoryIds: string) {
    return ArtistCategoriesModel.query().alias('ac').whereIn('ac.id', categoryIds.split(','));
  }

  getTopArtists() {
    return ArtistModel.query().alias('a');
  }

  getBuzzingArtists() {
    return ArtistModel.query().alias('a');
  }

  getYourArtists(userId: string) {
    return ArtistModel.query()
      .alias('a')
      .join(
        UserFeedPreferencesModel.getTableNameWithAlias('ufp'),
        UserFeedPreferencesModel.callbacks.onArtistIdAndUserIdVal(userId, 'a', 'ufp'),
      );
  }

  getArtistCategoryById(id: number) {
    return ArtistCategoriesModel.query().alias('ac').findById(id);
  }

  getUnderTheRadarArtists() {
    const constant = this.constantsRepo.getConstant(ConstantId.UNDER_THE_RADAR_ARTIST_SCORE);

    return ArtistModel.query()
      .alias('a')
      .joinRelated(expr([Relations.ArtistGenre, 'ag', [Relations.Genre, 'g']]))
      .join(
        ArtistScoresModel.getTableNameWithAlias('asr'),
        ArtistScoresModel.callbacks.joinOnArtistIdAndMaxRun('id', 'a', 'asr'),
      )
      .join(ArtistCategoryModel.getTableNameWithAlias('ac'), function () {
        this.on('ac.artistId', 'a.id').andOn('ac.run', 'asr.run');
      })
      .where('asr.score', '<=', constant.select('value'))
      .where('ac.categoryId', '<=', 8)
      .where('ag:g.topGenre', 1);
  }
}
