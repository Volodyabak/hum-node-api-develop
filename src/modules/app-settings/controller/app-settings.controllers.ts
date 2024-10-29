import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppSettingsQueryDto, AppSettingsResponseDto } from '../dto/app-settings.dto';
import { AppSettingsService } from '../../../Services/AppSettings/AppSettingsService';

@Controller()
@ApiTags('AppSettings')
@ApiBearerAuth()
export class AppSettingsControllers {
  @Get('appSettings')
  @ApiTags('Settings')
  @ApiOperation({
    summary: 'Toggles app settings',
    description:
      'Which app setting will be toggled is defined by type query param, ' +
      'if no param is provided, then all app settings will be toggled',
  })
  async showAlbumImages(@Query() query: AppSettingsQueryDto): Promise<AppSettingsResponseDto> {
    return AppSettingsService.toggleAppSetting(query.type);
  }
}
