import { Module } from '@nestjs/common';
import { ConstantsRepository } from './repository/constants.repository';

@Module({
  providers: [ConstantsRepository],
  exports: [ConstantsRepository],
})
export class ConstantsModule {}
