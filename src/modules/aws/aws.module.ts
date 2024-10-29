import { Module, forwardRef } from '@nestjs/common';
import { S3Service } from './services/s3.service';
import { S3Controller } from './controllers/s3.controller';
import { CognitoService } from './services/cognito.service';
import { CompaniesModule } from '../companies/companiesModule';

@Module({
  imports: [forwardRef(() => CompaniesModule)],
  controllers: [S3Controller],
  providers: [S3Service, CognitoService],
  exports: [S3Service, CognitoService],
})
export class AwsModule {}
