import { Module } from '@nestjs/common';
import { AppleMusicController } from './controllers/apple-music.controller';
import { MusicKitService } from './services/music-kit.service';
import { AppleMusicService } from './services/apple-music.service';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [RepositoryModule],
  controllers: [AppleMusicController],
  providers: [AppleMusicService, MusicKitService],
  exports: [MusicKitService, AppleMusicService],
})
export class AppleMusicModule {}
