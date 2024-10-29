import { Module } from '@nestjs/common';
import { TestsController } from './controllers/tests.controller';
import { OneSignalModule } from '../one-signal/one-signal.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [OneSignalModule, TasksModule],
  controllers: [TestsController],
  providers: [],
  exports: [],
})
export class TestsModule {}
