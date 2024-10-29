import { CognitoIdentityServiceProvider } from 'aws-sdk';

export class CognitoService {
  private readonly _client: CognitoIdentityServiceProvider;

  constructor() {
    this._client = new CognitoIdentityServiceProvider({
      region: process.env.AWS_REGION,
    });
  }

  async deleteUser(accessToken: string) {
    try {
      return this._client.deleteUser({ AccessToken: accessToken }).promise();
    } catch (err) {
      console.log('CognitoServiceError:::', err);
      throw err;
    }
  }
}
