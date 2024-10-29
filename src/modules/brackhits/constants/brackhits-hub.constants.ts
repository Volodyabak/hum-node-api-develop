/***
 * Brackhits home constants
 */

export const BRACKHIT_CARDS_TAKE_QUERY_DEFAULT = 5;
export const BRACKHIT_TOP_USERS_TAKE_QUERY_DEFAULT = 5;

export enum BrackhitHubs {
  MadeByFans = 1,
  _10s = 2,
  _00s = 3,
  _90s = 4,
  Rock = 6,
  Pop = 7,
  HipHop = 9,
  RnB = 10,
  Indie = 17,
  Country = 8,
  Latin = 12,
  Electronic = 15,
}

export enum BrackhitCategory {
  Featured = 1,
  Trending = 2,
  Popular = 3,
  FromArtistory = 4,
  ForYou = 5,
  Albums = 6,
  MadeByFans = 7,
  HipHop = 8,
  Pop = 9,
  Indie = 10,
  Rock = 11,
  RnB = 12,
  NewMusic = 13,
  _2020s = 18,
  _2010s = 19,
  _2000s = 20,
  _90s = 21,
  _80s = 22,
  _70s = 23,
  _60s = 24,
  SingleArtist = 25,
  BrackhitHubs = 26,
  MostBrackhitCompletions = 27,
  TopCreators = 28,
  SuperFans = 29,
  FromYourFriends = 30,
  MyBrackhits = 31,
  InProgress = 32,
  AllTimeFavorites = 33,
  FromMyArtists = 42,
}

export enum CategoryType {
  Category = 'category',
  Tag = 'tag',
  Genre = 'genre',
  Hubs = 'hubs',
  Users = 'users',
}

export enum CategorySortingType {
  BrackhitId = 'brackhit_id',
  Completions = 'completions',
  UserValue = 'user_value',
  Comments = 'comments',
  Shares = 'shares',
  Random = 'random',
}

export enum BrackhitHubTypes {
  Tag = 'tag',
  Genre = 'genre',
}

export enum BrackhitCardTypes {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
}

export const BrackhitSpecialHubs = [
  BrackhitHubs.MadeByFans,
  BrackhitHubs._10s,
  BrackhitHubs._00s,
  BrackhitHubs._90s,
];

export const BrackhitEraHubs = [BrackhitHubs._10s, BrackhitHubs._00s, BrackhitHubs._90s];

export const BrackhitGenreCategories = [
  BrackhitCategory.HipHop,
  BrackhitCategory.Pop,
  BrackhitCategory.Indie,
  BrackhitCategory.Rock,
  BrackhitCategory.RnB,
];

export const HUB_CARDS_ORDER = [7, 9, 1, 6, 2, 3, 10, 17, 4, 12, 15, 8];

/***
 * Other constants
 */

export const BRACKHIT_TRENDING_PERIOD = 48; // hours
export const BRACKHIT_HUB_TRENDING_PERIOD = 96; // hours
export const BRACKHIT_SUBMISSION_PERIOD = 30; // days

/***
 * Category cards order on different screens
 */

export const HOME_CATEGORIES_ORDER = [1, 2, 7, 4, 3, 5, 6];
export const MBF_HUB_CATEGORIES_ORDER = [2, 4, 8, 9, 10, 11, 12, 3]; // hubId = 1
export const ERA_HUB_CATEGORIES_ORDER = [2, 4, 3, 8, 9, 10, 11, 12]; // hubId = 2, 3, 4
export const HUB_CATEGORIES_ORDER = [1, 2, 7, 3, 4, 5, 6]; // hubId = genreId
export const NO_CATEGORIES_ORDER = [0];

export enum BrackhitTags {
  _60s = 1,
  _70s = 2,
  _80s = 3,
  _90s = 4,
  _00s = 5,
  _10s = 6,
  _20s = 7,
  Album = 8,
  SingleArtist = 9,
  NewMusic = 13,
  VS = 14,
  Madness = 15,
  IconMadness = 16,
  PopMadness = 17,
  HipHopMadness = 18,
  MVPsMadness = 19,
}

/***
 * Brackhit category cards brackhits count
 */

export const BRACKHIT_HOME_TAG_CARD_COUNT = 5;
export const BRACKHIT_HUB_TAG_CARD_COUNT = 5;
export const BRACKHIT_HUB_AND_TAG_COUNT = 10;
export const BRACKHITS_FOR_YOU_FULL_COUNT = 15;
export const BRACKHITS_CARD_DEFAULT_COUNT = 7;

// maps home category card to number of preview brackhits in it
export const BRACKHITS_HOME_CATEGORY_CARD_COUNT = new Map([
  [BrackhitCategory.Featured, 10],
  [BrackhitCategory.Trending, 14],
  [BrackhitCategory.MadeByFans, 15],
  [BrackhitCategory.FromArtistory, 12],
  [BrackhitCategory.Popular, 15],
  [BrackhitCategory.Albums, 15],
]);

// maps hub category card to number of preview brackhits in it
export const BRACKHITS_HUB_CATEGORY_CARD_COUNT = new Map([
  [BrackhitCategory.Trending, 14],
  [BrackhitCategory.MadeByFans, 15],
  [BrackhitCategory.FromArtistory, 12],
]);

/***
 * Brackhit categories mapped to hubs in which they appear
 */

export const BRACKHIT_HOME_CATEGORIES = [
  BrackhitCategory.Featured,
  BrackhitCategory.Popular,
  BrackhitCategory.FromArtistory,
  BrackhitCategory.Trending,
  BrackhitCategory.ForYou,
  BrackhitCategory.Albums,
  BrackhitCategory.MadeByFans,
];

export const BRACKHIT_HUB_CATEGORIES = [
  BrackhitCategory.Featured,
  BrackhitCategory.Popular,
  BrackhitCategory.FromArtistory,
  BrackhitCategory.Trending,
  BrackhitCategory.ForYou,
  BrackhitCategory.Albums,
  BrackhitCategory.MadeByFans,
];

export const BRACKHIT_SPECIAL_HUB_CATEGORIES = [
  BrackhitCategory.Featured,
  BrackhitCategory.Trending,
  BrackhitCategory.Popular,
  BrackhitCategory.FromArtistory,
  BrackhitCategory.HipHop,
  BrackhitCategory.Pop,
  BrackhitCategory.Indie,
  BrackhitCategory.Rock,
  BrackhitCategory.RnB,
];

/***
 * Brackhit tags mapped to hubs in which they appear
 */

export const BRACKHIT_HOME_TAGS = [BrackhitTags.NewMusic];

export const BrackhitHubTags = {
  Rock: [BrackhitTags._90s, BrackhitTags._80s, BrackhitTags._70s, BrackhitTags._60s],
  Pop: [BrackhitTags._20s, BrackhitTags._10s, BrackhitTags._00s],
  HipHop: [BrackhitTags._20s, BrackhitTags._10s, BrackhitTags._00s, BrackhitTags._90s],
  RnB: [BrackhitTags._90s],
  Indie: [BrackhitTags._10s],
  MadeByFans: [BrackhitTags._20s, BrackhitTags._10s, BrackhitTags._00s, BrackhitTags._90s],
  _10s: [BrackhitTags.Album, BrackhitTags.SingleArtist],
  _00s: [BrackhitTags.Album, BrackhitTags.SingleArtist],
  _90s: [BrackhitTags.Album, BrackhitTags.SingleArtist],
};

// maps hubId to tagIds which appear in this hub
export const BRACKHIT_HUB_TAG_MAP = new Map([
  [BrackhitHubs.Rock, BrackhitHubTags.Rock],
  [BrackhitHubs.Pop, BrackhitHubTags.Pop],
  [BrackhitHubs.HipHop, BrackhitHubTags.HipHop],
  [BrackhitHubs.RnB, BrackhitHubTags.RnB],
  [BrackhitHubs.Indie, BrackhitHubTags.Indie],
  [BrackhitHubs.MadeByFans, BrackhitHubTags.MadeByFans],
  [BrackhitHubs._10s, BrackhitHubTags._10s],
  [BrackhitHubs._00s, BrackhitHubTags._00s],
  [BrackhitHubs._90s, BrackhitHubTags._90s],
]);

/***
 * Helper Maps objects
 */

// maps hubId of era hub to its appropriate tagId
export const BRACKHIT_ERA_HUB_TAG_MAP = new Map([
  [BrackhitHubs._90s, BrackhitTags._90s],
  [BrackhitHubs._00s, BrackhitTags._00s],
  [BrackhitHubs._10s, BrackhitTags._10s],
]);

// maps categoryId of genre category to its appropriate genreId
export const BRACKHIT_CATEGORY_GENRES_MAP = new Map([
  [BrackhitCategory.HipHop, BrackhitHubs.HipHop],
  [BrackhitCategory.Pop, BrackhitHubs.Pop],
  [BrackhitCategory.Indie, BrackhitHubs.Indie],
  [BrackhitCategory.Rock, BrackhitHubs.Rock],
  [BrackhitCategory.RnB, BrackhitHubs.RnB],
]);

export const BRACKHIT_HOME_HUBS = [
  BrackhitHubs.Rock,
  BrackhitHubs.Pop,
  BrackhitHubs.HipHop,
  BrackhitHubs.RnB,
];
