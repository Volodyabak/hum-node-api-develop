import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthSignUpDto } from '../dto/auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostSignupInput } from '../dto/input/post-signup.input';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { MailchimpCallbackInput } from '../dto/input/mailchimp-callback.input';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Email authentication',
    description: 'Create user via email and password',
  })
  async signUp(@Body() body: AuthSignUpDto) {
    return this.authService.authenticate(body);
  }

  @Post('post-signup')
  @ApiOperation({
    summary: 'Post signup',
    description: 'Creates user in the database after signup',
  })
  async postSignUp(@Body() body: PostSignupInput, @ResCtx() ctx: ResponseContext) {
    return this.authService.handlePostSignUp(ctx.userId, body);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Login via email and password',
  })
  async login(@Body() body: AuthSignUpDto) {
    return this.authService.login(body);
  }

  @Post('login/company')
  async companyLogin(@Body() body: AuthSignUpDto) {
    return this.authService.companyLogin(body);
  }

  @Get('/mailchimp')
  async mailchimpAuth(@Res() res) {
    const queryParams = new URLSearchParams([
      ['response_type', 'code'],
      ['client_id', process.env.MAILCHIMP_CLIENT_ID],
      ['redirect_uri', process.env.MAILCHIMP_REDIRECT_URI],
    ]);

    return res.redirect(`https://login.mailchimp.com/oauth2/authorize?${queryParams}`);
  }

  @Get('/mailchimp/callback')
  async mailchimpAuthCallback(@Query() query: MailchimpCallbackInput) {
    const data = await this.authService.handleMailchimpAuth(query);
    return { data };
  }
}
