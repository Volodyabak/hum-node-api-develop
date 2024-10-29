export type YoutubeVideoItem = {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard: { url: string; width: number; height: number };
      maxres: { url: string; width: number; height: number };
    };
    channelId: string;
    channelTitle: string;
    categoryId: string;
    publishedAt: Date;
  };
  status: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
  };
};

export type PageInfo = {
  totalResults: number;
  resultsPerPage: number;
};

export type YoutubeVideoRes = {
  kind: string;
  etag: string;
  items: YoutubeVideoItem[];
  pageInfo: PageInfo;
};
