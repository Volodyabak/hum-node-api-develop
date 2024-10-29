import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import { decode } from 'jsonwebtoken';
import { v4 } from 'uuid';

import { generateUniqueUsername } from '../../../Tools';
import { cognitoConfig } from '../configs/cognito.config';
import { DEFAULT_USER_IMAGE, ErrorConst } from '../../../constants';
import { Relations } from '@database/relations/relations';
import { expr } from '@database/relations/relation-builder';
import { AuthSignUpDto, AuthSignUpResponseDto } from '../dto/auth.dto';
import { RepositoryService } from '../../repository/services/repository.service';
import { PostSignupInput } from '../dto/input/post-signup.input';
import { UserRepository } from '../../repository/repositories/user/user.repository';
import axios from 'axios';
import { CompanyIntegrationTokensModel } from '@database/Models/Company/company-integration-tokens.model';
import { MailchimpCallbackInput } from '../dto/input/mailchimp-callback.input';
import { IntegrationSourcesModel } from '@database/Models/Company/integration-sources.model';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly userPool: CognitoUserPool;
  private readonly userRepo: UserRepository;

  constructor(private readonly repositoryService: RepositoryService) {
    this.userPool = new CognitoUserPool({
      UserPoolId: cognitoConfig.userPoolId,
      ClientId: cognitoConfig.clientId,
    });
    this.userRepo = repositoryService.userRepo;
  }

  async authenticate(data: AuthSignUpDto): Promise<AuthSignUpResponseDto> {
    const dbUser = await this.userRepo.findAwsUser({ email: data.email });

    if (dbUser) {
      throw new Error(ErrorConst.USER_ALREADY_EXISTS);
    }

    const username = v4();
    const attributes = [new CognitoUserAttribute({ Name: 'email', Value: data.email })];

    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: data.password,
    });

    const cognitoUser = await new Promise<ISignUpResult>((resolve, reject) => {
      return this.userPool.signUp(username, data.password, attributes, attributes, (err, res) => {
        if (err) {
          this.logger.error(err);
          reject(err);
        }
        resolve(res);
      });
    });

    await this.userRepo.saveAwsUser(
      cognitoUser.userSub,
      generateUniqueUsername(),
      { email: data.email },
      { userImage: DEFAULT_USER_IMAGE },
    );

    const session = await new Promise<CognitoUserSession>((resolve, reject) => {
      return cognitoUser.user.authenticateUser(authenticationDetails, {
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          this.logger.error(err);
          reject(err);
        },
      });
    });

    return {
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      isValid: session.isValid(),
    };
  }

  async login(data: AuthSignUpDto): Promise<AuthSignUpResponseDto> {
    const authenticationDetails = new AuthenticationDetails({
      Username: data.email,
      Password: data.password,
    });

    const userData = {
      Username: data.email,
      Pool: this.userPool,
    };

    const user = new CognitoUser(userData);

    const session = await new Promise<CognitoUserSession>((resolve, reject) => {
      return user.authenticateUser(authenticationDetails, {
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          this.logger.error(err);
          if (err.code === 'NotAuthorizedException') {
            throw new Error(ErrorConst.INCORRECT_USERNAME_OR_PASSWORD);
          } else if (err.code === 'UserNotFoundException') {
            throw new Error(ErrorConst.USER_DOES_NOT_EXIST);
          }
          reject(err);
        },
      });
    });

    return {
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      isValid: session.isValid(),
    };
  }

  async companyLogin(data: AuthSignUpDto) {
    const tokens = await this.login(data);
    const payload = decode(tokens.accessToken) as any;
    const [user, companies] = await Promise.all([
      this.userRepo.findAwsUser({ sub: payload.sub }).withGraphFetched(expr([Relations.Profile])),
      this.repositoryService.companyRepo.getUserCompanies(payload.sub),
    ]);

    if (!user) {
      throw new Error(ErrorConst.INCORRECT_USERNAME_OR_PASSWORD);
    }

    return {
      ...tokens,
      user: {
        userId: user.sub,
        email: user.email,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      },
      companyIds: companies.map((el) => el.companyId),
    };
  }

  async handlePostSignUp(userId: string, data: PostSignupInput) {
    const dbUser = await this.userRepo.findAwsUser({ email: data.email });

    if (dbUser) {
      throw new Error(ErrorConst.USER_ALREADY_EXISTS);
    }

    return this.userRepo.saveAwsUser(
      userId,
      generateUniqueUsername(),
      { email: data.email },
      { userImage: DEFAULT_USER_IMAGE },
    );
  }

  async handleMailchimpAuth(query: MailchimpCallbackInput) {
    try {
      const body = new URLSearchParams([
        ['grant_type', 'authorization_code'],
        ['client_id', process.env.MAILCHIMP_CLIENT_ID],
        ['client_secret', process.env.MAILCHIMP_CLIENT_SECRET],
        ['redirect_uri', process.env.MAILCHIMP_REDIRECT_URI],
        ['code', query.code],
      ]);
      const { data } = await axios.post('https://login.mailchimp.com/oauth2/token', body);

      let source = await IntegrationSourcesModel.query().findOne({ integrationName: 'mailchimp' });

      if (!source) {
        source = await IntegrationSourcesModel.query().insertAndFetch({
          integrationName: 'mailchimp',
        });
      }

      await CompanyIntegrationTokensModel.query().insertGraph({
        integrationId: source.id,
        companyId: query.companyId,
        accessToken: data.access_token,
        expiresAt: null,
      });

      return data;
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err?.response?.data?.error);
    }
  }
}
