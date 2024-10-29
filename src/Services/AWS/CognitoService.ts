import { CognitoIdentityServiceProvider } from 'aws-sdk';

class CognitoService {
  private readonly client = new CognitoIdentityServiceProvider({
    region: process.env.AWS_REGION,
  });

  async deleteUser(accessToken: string) {
    try {
      return this.client.deleteUser({AccessToken: accessToken}).promise();
    } catch (err) {
      console.log('CognitoServiceError:::', err);
      throw err;
    }
  }
}

const instance = new CognitoService();
export { instance as CognitoService };
