import { Module } from '@nestjs/common';
import { MailchimpService } from './services/mailchimp.service';
import { MailchimpController } from './controllers/mailchimp.controller';

@Module({
  controllers: [MailchimpController],
  providers: [MailchimpService],
  exports: [MailchimpService],
})
export class MailchimpModule {}
