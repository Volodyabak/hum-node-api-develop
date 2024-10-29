import { ArtistCategoriesModel, ArtistModel } from '../../../../database/Models';
import { ArtistCategoryDto, ArtistItemDto } from '../dto/artist-home.dto';

export class ArtistHomeParser {
  static parseCategoryCard(c: ArtistCategoriesModel): ArtistCategoryDto {
    return {
      id: c.id,
      name: c.categoryName,
      type: c.type,
      cardType: c.cardType,
      data: c.data,
    };
  }

  static parseArtistItems(artists: ArtistModel[]): ArtistItemDto[] {
    return artists.map((a) => ({
      id: a.id,
      name: a.facebookName,
      image: a.imageFile,
      genreId: a.genreId,
    }));
  }
}
