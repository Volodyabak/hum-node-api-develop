import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ContactDto {
    @IsString()
    company: string;

    @IsString()
    address1: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    zip: string;

    @IsString()
    country: string;
}

class CampaignDefaultsDto {
    @IsString()
    from_name: string;

    @IsString()
    from_email: string;

    @IsString()
    subject: string;

    @IsString()
    language: string;
}

export class CreateListDto {
    @IsString()
    listName: string;

    @ValidateNested()
    @Type(() => ContactDto)
    contact: ContactDto;

    @IsString()
    permission_reminder: string;

    @ValidateNested()
    @Type(() => CampaignDefaultsDto)
    campaign_defaults: CampaignDefaultsDto;
}
