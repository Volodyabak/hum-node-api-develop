import { ApiProperty } from '@nestjs/swagger';

export class UserOutput {
  @ApiProperty({ description: 'Full name of the user', example: 'Stewart Hall' })
  name: string;

  @ApiProperty({ description: 'Email address of the user', example: 'b_genki@hotmail.com' })
  email: string;

  @ApiProperty({ description: 'Country where the user is located', example: 'United States' })
  country: string;

  @ApiProperty({ description: 'Region or state of the user', example: 'UT' })
  region: string;

  @ApiProperty({ description: 'City of the user', example: 'Herriman' })
  city: string;

  @ApiProperty({ description: 'User zip code', example: '84096' })
  zipCode: string;

  @ApiProperty({ description: 'Quiz score of the user', example: 3 })
  score: number;

  @ApiProperty({ description: 'Number of questions answered by the user', example: 3 })
  answers: number;

  @ApiProperty({ description: 'Timestamp of when the user submitted the form', example: 'Aug 23, 2024 5:55 AM' })
  timeSubmitted: string;
}
