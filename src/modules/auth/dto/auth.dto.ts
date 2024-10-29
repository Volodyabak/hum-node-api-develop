import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthSignUpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, {
    message: 'password must be at least 8 characters long',
  })
  @Matches(/[a-z]/, { message: 'password must contain lowercase letters' })
  @Matches(/\d/, { message: 'password must contain numbers' })
  password: string;
}

export class AuthSignUpResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  isValid: boolean;
}
