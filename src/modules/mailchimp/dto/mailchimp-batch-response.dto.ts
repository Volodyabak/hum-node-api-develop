import { IsNotEmpty, IsString, IsArray, IsObject, IsOptional } from 'class-validator';
import { SyncService } from 'src/modules/sync-bridge/services/sync-bridge.service';

export class UserDetailsMailchimp {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  status: string; 

  @IsOptional()
  @IsString()
  error?: string;
}

export class BatchDetailsMailchimp {
  @IsNotEmpty()
  @IsString()
  batchId: string;

  @IsNotEmpty()
  totalOperations: number;

  @IsNotEmpty()
  finishedOperations: number;

  @IsNotEmpty()
  erroredOperations: number;
}

export class MailchimpBatchResponseDto {
  @IsNotEmpty()
  @IsString()
  status: string; 

  @IsNotEmpty()
  @IsString()
  service: SyncService; 

  @IsNotEmpty()
  @IsArray()
  users: UserDetailsMailchimp[];

  @IsOptional()
  @IsObject()
  batchDetails?: BatchDetailsMailchimp;
}
