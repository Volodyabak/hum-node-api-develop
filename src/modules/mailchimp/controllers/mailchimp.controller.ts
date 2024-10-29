import { Controller, Post, Body, Get } from '@nestjs/common';
import { MailchimpService } from '../services/mailchimp.service';
import { CreateListDto } from '../dto/create-list.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('mailchimp')
@ApiTags('Mailchimp')
export class MailchimpController {
  constructor(private readonly mailchimpService: MailchimpService) {}

  @Get('/lists')
  @ApiOperation({
    summary: "Mailchimp user's list",
    description: "Retrieving all user's lists",
  })
  async getMailchimpLists() {
    return this.mailchimpService.getAllLists();
  }

  @Post('/create-list')
  @ApiOperation({
    summary: 'Create a Mailchimp list',
    description: 'Creates a new list in Mailchimp.',
  })
  async createList(@Body() createListDto: CreateListDto) {
    return this.mailchimpService.createList(createListDto);
  }
}
