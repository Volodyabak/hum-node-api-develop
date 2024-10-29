import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ExportDataToMailchimpDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
