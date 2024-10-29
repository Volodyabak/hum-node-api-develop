import { Body, Controller, Get, HttpCode, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SpotifyService } from '../services/spotify.service';
import {
  PostPlaylistBodyDto,
  PostPlaylistQueryDto,
  PostPlaylistResponseDto,
  GetPlaylistQueryDto,
  GetPlaylistResponseDto,
  PostCodeExchangeDto,
  SpotifyCodeExchangeResponseDto,
  GetSpotifyAuthorizeQueryDto,
} from '../dto/spotify-api.dto';
import { spotifyWebApiConfig } from '../configs/spotify.config';

@Controller('/spotify')
@ApiTags('Spotify')
@ApiBearerAuth()
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('authorize')
  async login(@Res() res, @Query() query: GetSpotifyAuthorizeQueryDto) {
    const queryParams = new URLSearchParams([
      ['client_id', spotifyWebApiConfig.clientId],
      ['response_type', 'code'],
      ['redirect_uri', query.redirectUri],
      ['scope', query.scope || 'user-read-email'],
    ]);

    return res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
  }

  @Post('code')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Exchange an authorization code for token',
    description: 'Exchange authorization code from spotify to tokens pair',
  })
  @ApiResponse({ status: 200, type: SpotifyCodeExchangeResponseDto })
  async codeExchange(@Body() body: PostCodeExchangeDto): Promise<SpotifyCodeExchangeResponseDto> {
    return this.spotifyService.codeExchange(body);
  }

  @Post('/playlist')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create playlist',
    description: 'Create playlist for brackhit',
  })
  @ApiResponse({ status: 200, type: PostPlaylistResponseDto })
  async createPlaylist(
    @Body() body: PostPlaylistBodyDto,
    @Query() query: PostPlaylistQueryDto,
  ): Promise<PostPlaylistResponseDto> {
    return this.spotifyService.createPlaylist(body, query.sort);
  }

  @Get('playlist')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Returns spotify tracks from a spotify playlist',
    description:
      'Deletes user brackhit choices, score and completion data, starts brackhit results calculation',
  })
  @ApiResponse({ status: 200, type: GetPlaylistResponseDto })
  async getSpotifyPlaylistTracks(
    @Query() query: GetPlaylistQueryDto,
  ): Promise<GetPlaylistResponseDto> {
    return this.spotifyService.getPlaylist(query.link);
  }
}
