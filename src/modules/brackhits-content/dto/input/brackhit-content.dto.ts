export type BrackhitContent = BrackhitContentDto | BrackhitCustomContentDto;

export class BrackhitContentDto {
  id: string | number;
  choiceId: number;
  data: BrackhitContentExtraData;
}

export class BrackhitCustomContentDto {
  name: string;
  thumbnail: string;
  contentUrl: string;
  sourceTypeId: number;
  choiceId: number;
}

export type BrackhitContentExtraData = YoutubeClipExtraData;

type YoutubeClipExtraData = { videoId: string };
