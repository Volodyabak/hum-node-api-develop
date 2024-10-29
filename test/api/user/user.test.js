const { v4 } = require('uuid');
const app = require('../../../src/app');
const { UserApi } = require('./user.api');
const { USER_ID } = require('../../mocks');
const { UserService } = require('../../../src/Services/User/UserService');

describe('User Controller', () => {
  jest.setTimeout(30000);
  const userApi = new UserApi(app);

  const firstName = 'Michael',
    lastName = 'Scott';
  const userData = {
    name: `${firstName} ${lastName}`,
    email: 'andriy.aleksieiev@extelasoft.com',
    sub: v4(),
  };

  describe('PUT /user/getMe', () => {
    beforeAll(async () => {
      const user = await UserService.getUser(USER_ID);
      if (!user) {
        const body = {
          name: 'Test Test',
          email: 'andrey.aleksieiev@extelasoft.com',
          sub: USER_ID,
        };
        await userApi.link(body);
      }
    });

    it('should update user profile', async () => {
      const data = {
        first_name: 'Matthew',
        last_name: 'Tuccio',
      };
      const { body, statusCode } = await userApi.putGetMe(data);
      expect(statusCode).toBe(200);
      expect(body.firstName).toBe(data.first_name);
      expect(body.lastName).toBe(data.last_name);
    });

    it('should fail if first name is not valid', async () => {
      const data = { first_name: 'm' };
      const { body, statusCode } = await userApi.putGetMe(data);
      expect(statusCode).toBe(400);
      expect(body.errors[0].msg).toBe('firstName must be at least 2 characters long');
    });

    it('should fail if last name is not valid', async () => {
      const data = { last_name: '' };
      const { body, statusCode } = await userApi.putGetMe(data);
      expect(statusCode).toBe(400);
      expect(body.errors[0].msg).toBe('lastName must be at least 1 characters long');
    });

    it('should fail if hometown is not valid', async () => {
      const data = { user_hometown: '' };
      const { body, statusCode } = await userApi.putGetMe(data);
      expect(statusCode).toBe(400);
      expect(body.errors[0].msg).toBe('userHometown must be at least 1 and at most 30 characters');
    });

    it('should fail if user bio is not valid', async () => {
      const data = {
        user_bio:
          '7b4w0M1RRe8KBgcnBlYEgatVh9jKbMI3WcViQ6meAZDGNCgZVYr9J5qBbb64MeKQeymCo3Azmnqu5QcHkzwDl0TzwhI1IE9b7MNXEVyD4RIsHyVziN7ad9YdLZW7335riT4kdFsmqfN0TgGixH9sDIv',
      };
      const { body, statusCode } = await userApi.putGetMe(data);
      expect(statusCode).toBe(400);
      expect(body.errors[0].msg).toBe('userBio must be no more than 150 characters');
    });

    it('should fail if username is less than 5 characters', async () => {
      const data = { username: 'dio' };
      const { body, statusCode } = await userApi.putGetMe(data);
      expect(statusCode).toBe(400);
      expect(body.errors[0].msg).toBe('username must be at least 5 and at most 20 characters');
    });

    it('should fail if username contains more than 20 characters', async () => {
      const data = { username: 'diosajrejiojiowoiddsd' };
      const { body, statusCode } = await userApi.putGetMe(data);
      expect(statusCode).toBe(400);
      expect(body.errors[0].msg).toBe('username must be at least 5 and at most 20 characters');
    });

    it('should fail if username contains wrong characters', async () => {
      const data = { username: '@andr!!' };
      const { body, statusCode } = await userApi.putGetMe(data);
      expect(statusCode).toBe(400);
      expect(body.errors[0].msg).toBe('username can only contain lowercase letters, numbers, dashes or underscores');
    });
  });

  describe('GET /user/getMe', () => {
    let user, profile;
    beforeAll(async () => {
      const result = await UserService.insertNewUser(userData);
      user = result.awsUser;
      profile = result.profile;
    });

    it('should return user', async () => {
      const { body, statusCode } = await userApi.getGetMe(userData.sub);
      expect(statusCode).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({
          userId: userData.sub,
          firstName: profile.firstName,
          lastName: profile.lastName,
          userBio: profile.userBio,
          username: profile.username,
          topArtists: [],
          topTracks: [],
          genres: [],
          friends: 0,
        })
      );
    });

    afterAll(async () => {
      await UserService.deleteUser(userData.sub);
    });
  });
});
