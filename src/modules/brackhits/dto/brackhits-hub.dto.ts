import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { BrackhitHubsModel } from '@database/Models';
import {
  BrackhitCategory,
  BrackhitHubs,
  BrackhitTags,
  CategoryType,
} from '../constants/brackhits-hub.constants';
import { BrackhitUserStatus } from '../constants/brackhits.constants';
import { BRACKHIT_THUMBNAIL } from '../../../api-model-examples';
import { ApiProperty } from '@nestjs/swagger';

export class BrackhitHubItemDto {
  @ApiProperty()
  id: BrackhitHubs;

  @ApiProperty()
  name: string;
}

export class BrackhitJustInParams {
  take?: number;
  includeMadeByFans?: boolean;
}

export class BrackhitsCardParamsDto {
  takeAll?: boolean;
}

export class ForYouBrackhitsParamsDto {
  take: number;
  noneStatus?: boolean;
}

export class BrackhitHubMetaDto {
  brackhitId: number;
  name: string;
  thumbnail: string;
  timeLive: Date;
  duration: number;
  scoringState: number;
  isCompleted: number;
  userStatus?: BrackhitUserStatus;
}

export class BrowseHubBrackhitsParamsDto {
  @ApiProperty()
  @IsEnum(BrackhitHubs)
  hubId: BrackhitHubs;
}

export class BrowseBrackhitsQueryDto {
  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(BrackhitCategory)
  category: BrackhitCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(BrackhitTags)
  tag: BrackhitTags;
}

export class BrackhitHomeHubsDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ isArray: true, type: () => BrackhitHubsModel })
  hubs: BrackhitHubsModel[];
}

export class BrackhitHubsCardDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ isArray: true, type: BrackhitHubItemDto })
  hubs: BrackhitHubItemDto[];
}

export class BrackhitItemPreviewDto {
  @ApiProperty()
  brackhitId: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: BRACKHIT_THUMBNAIL })
  thumbnail: string;

  @ApiProperty()
  isLive: 0 | 1;

  @ApiProperty({ example: BrackhitUserStatus.None })
  userStatus: BrackhitUserStatus;
}

export class BrackhitCardDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({})
  name: string;

  @ApiProperty()
  type: CategoryType;

  @ApiProperty()
  cardType: 1 | 2;

  @ApiProperty({ isArray: true, type: BrackhitItemPreviewDto })
  brackhits: BrackhitItemPreviewDto[];
}
