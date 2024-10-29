import { Module, forwardRef } from '@nestjs/common';
import { CompaniesController } from './controllers/companies.controller';
import { CompaniesService } from './services/companies.service';
import { RepositoryModule } from '../repository/repository.module';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [forwardRef(() => AwsModule), RepositoryModule],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService]
})
export class CompaniesModule {}
