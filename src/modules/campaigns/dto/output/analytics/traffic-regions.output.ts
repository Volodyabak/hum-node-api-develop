import { ApiProperty } from '@nestjs/swagger';

export class SiteVisit {
  @ApiProperty({ description: 'Date of the site visit', example: '2024-08-19' })
  date: string;

  @ApiProperty({ description: 'Number of unique visitors on this date', example: 6000 })
  uniqueSiteVisitors: number;

  @ApiProperty({ description: 'Number of submissions on this date', example: 5800 })
  submissions: number;
}

export class TrafficSource {
  @ApiProperty({ description: 'Traffic source name', example: 'Email' })
  source: string;

  @ApiProperty({ description: 'Number of users coming from this source', example: 2500 })
  users: number;

  @ApiProperty({ description: 'Percentage of traffic coming from this source', example: 69.36 })
  percentage: number;
}

export class UsersByRegion {
  @ApiProperty({ description: 'Region or state', example: 'CA' })
  region: string;

  @ApiProperty({ description: 'Number of users from this region', example: 2500 })
  users: number;
}

export class TrafficRegionsOutput {
  @ApiProperty({
    description: 'List of site visits by date',
    type: [SiteVisit],
    example: [
      { date: '2024-08-19', uniqueSiteVisitors: 6000, submissions: 5800 },
      { date: '2024-08-26', uniqueSiteVisitors: 2000, submissions: 1800 }
    ]
  })
  siteVisits: SiteVisit[];

  @ApiProperty({
    description: 'List of traffic sources and their respective percentages',
    type: [TrafficSource],
    example: [
      { source: 'Email', percent: 69.36 },
      { source: 'Direct', percent: 21.05 }
    ]
  })
  trafficSource: TrafficSource[];

  @ApiProperty({
    description: 'List of users by regions',
    type: [UsersByRegion],
    example: [
      { region: 'CA', users: 2500 },
      { region: 'TX', users: 1800 }
    ]
  })
  usersByRegions: UsersByRegion[];
}
