import { Module } from '@nestjs/common';
import { MailchimpService } from '../mailchimp/services/mailchimp.service';
import { SyncBridgeService } from './services/sync-bridge.service';
import { TransformerService } from './services/transformer.service';

@Module({
  providers: [SyncBridgeService, TransformerService, MailchimpService],
  exports: [SyncBridgeService],
})
export class SyncBridgeModule {}
