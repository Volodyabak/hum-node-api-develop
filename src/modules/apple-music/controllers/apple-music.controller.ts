import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppleMusicService } from '../services/apple-music.service';
import { SaveMusicUserTokenInput } from '../dto/apple-music.input';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { UserFeedPreferencesModel } from '../../../../database/Models';
import { AppleUserTokensModel } from '../../../../database/Models/apple/apple-user-tokens.model';

@ApiBearerAuth()
@ApiTags('Apple Music')
@Controller('apple-music')
export class AppleMusicController {
  constructor(private readonly appleMusicService: AppleMusicService) {}

  @Post('music-token')
  @ApiTags('Save Music User Token')
  @ApiOperation({
    summary: 'Saves music user token',
    description: 'Saves apple music user token to database',
  })
  @ApiResponse({ status: 200, type: AppleUserTokensModel })
  async saveMusicUserToken(
    @Body() body: SaveMusicUserTokenInput,
    @ResCtx() ctx: ResponseContext,
  ): Promise<AppleUserTokensModel> {
    return this.appleMusicService.saveMusicUserToken(ctx.userId, body.musicUserToken);
  }

  @Post('user-preferences')
  @ApiTags('Update User Preferences')
  @ApiOperation({
    summary: 'Updates user preferences',
    description: 'Updates user preferences based on the apple music recently played songs',
  })
  @ApiResponse({ status: 200, type: [UserFeedPreferencesModel] })
  async updateUserPreferences(@ResCtx() ctx: ResponseContext): Promise<UserFeedPreferencesModel[]> {
    return this.appleMusicService.updateUserPreferences(ctx.userId);
  }
}
