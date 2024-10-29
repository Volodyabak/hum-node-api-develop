export interface RecentlyPlayedTracksResponse {
  next: string;
  data: Song[];
}

export interface Song {
  id: string;
  type: string; // songs
  href: string;
  attributes: {
    albumName: string;
    genreNames: string[];
    trackNumber: number;
    durationInMillis: number;
    releaseDate: string;
    isrc: string;
    artwork: {
      width: number;
      height: number;
      url: string;
      bgColor: string;
      textColor1: string;
      textColor2: string;
      textColor3: string;
      textColor4: string;
    };
    composerName: string;
    url: string;
    playParams: {
      id: string;
      kind: string; // song;
    };
    discNumber: number;
    hasLyrics: boolean;
    isAppleDigitalMaster: boolean;
    name: string;
    previews: [
      {
        url: string;
      },
    ];
    artistName: string;
  };
}
