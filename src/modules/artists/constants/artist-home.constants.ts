export const GET_ARTIST_HOME_TAKE_DEFAULT = 5;

export enum ArtistCategoryIds {
  TopArtists = 1,
  BuzzingArtists = 2,
  YourArtists = 3,
  UnderTheRadar = 4,
  Legacy = 5,
  Emerging = 6,
}

export enum ArtistCategoryTypes {
  Category = 'category',
  ArtistCategory = 'artist_category',
}

export enum ArtistCategorySortingIds {
  BrackhitCompletions = 1,
  DailyBuzz = 2,
  ArtistName = 3,
  Appearances = 4,
}

export const ARTIST_CATEGORIES_WITH_GENRE = [ArtistCategoryIds.UnderTheRadar];
