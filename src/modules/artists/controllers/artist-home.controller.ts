import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GetArtistHomePreviewResponseDto,
  GetArtistHomeQueryDto,
} from '../dto/api-dto/artist-home.api-dto';
import { ArtistHomeService } from '../services/artist-home.service';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { ArtistCategoryDto } from '../dto/artist-home.dto';

@Controller('artist/home')
@ApiTags('Artist Home')
@ApiBearerAuth()
export class ArtistHomeController {
  constructor(private readonly artistHomeService: ArtistHomeService) {}

  @Get('/')
  @ApiOperation({
    summary:
      'Returns artist categories for Artist Home screen. If categoryId param is not specified,' +
      'then paginated array of artist categories with fixed number of artists is returned. Otherwise' +
      'only category object is returned with paginated array of artists.',
  })
  @ApiResponse({ status: 200, type: GetArtistHomePreviewResponseDto })
  async getArtistHome(
    @Query() query: GetArtistHomeQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetArtistHomePreviewResponseDto | ArtistCategoryDto> {
    if (query.categoryId === undefined) {
      return this.artistHomeService.getArtistHomePreviewResponse(ctx.userId, query);
    } else {
      return this.artistHomeService.getArtistHomeCategoryFull(ctx.userId, query);
    }
  }
}
