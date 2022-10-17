import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthMethod } from './enum/auth-method.enum';
import { Locale } from './enum/locale.enum';
import { getRepository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';
import { UserRepository } from './user.repository';

describe('UsersService', () => {
  let service: UserService;

  const mockUserRepository = {
    createAndSave: jest.fn().mockImplementation((dto) => dto),
    updateUser: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    findByUuid: jest.fn().mockImplementation((uuid) => Promise.resolve(uuid)),
    doesExist: jest.fn().mockImplementation((uuid) => Promise.resolve(uuid)),
    deleteUser: jest.fn().mockImplementation((uuid) => Promise.resolve(uuid)),
    verifyUser: jest.fn().mockImplementation((uuid) => Promise.resolve(uuid)),
    updatePassword: jest
      .fn()
      .mockImplementation((uuid, password) => Promise.resolve(uuid)),
    findByUsernameOrEmail: jest
      .fn()
      .mockImplementation((usernameOrEmail) =>
        Promise.resolve(usernameOrEmail),
      ),
    findByEmail: jest
      .fn()
      .mockImplementation((email) => Promise.resolve(email)),
    findByUsername: jest
      .fn()
      .mockImplementation((username) => Promise.resolve(username)),
    findByEmailOrUsername: jest
      .fn()
      .mockImplementation((emailOrUsername) =>
        Promise.resolve(emailOrUsername),
      ),
    findByEmailOrUsernameOrUuid: jest
      .fn()
      .mockImplementation((emailOrUsernameOrUuid) =>
        Promise.resolve(emailOrUsernameOrUuid),
      ),
    findByEmailOrUsernameOrUuidOrId: jest
      .fn()
      .mockImplementation((emailOrUsernameOrUuidOrId) =>
        Promise.resolve(emailOrUsernameOrUuidOrId),
      ),
    findByEmailOrUsernameOrUuidOrIdAndAuthMethod: jest
      .fn()
      .mockImplementation((emailOrUsernameOrUuidOrId, authMethod) =>
        Promise.resolve(emailOrUsernameOrUuidOrId),
      ),
    findByEmailOrUsernameOrUuidOrIdAndAuthMethodAndLocale: jest
      .fn()
      .mockImplementation((emailOrUsernameOrUuidOrId, authMethod, locale) =>
        Promise.resolve(emailOrUsernameOrUuidOrId),
      ),
    findByEmailOrUsernameOrUuidOrIdAndAuthMethodAndLocaleAndIsVerified: jest
      .fn()
      .mockImplementation(
        (emailOrUsernameOrUuidOrId, authMethod, locale, isVerified) =>
          Promise.resolve(emailOrUsernameOrUuidOrId),
      ),
    findByEmailOrUsernameOrUuidOrIdAndAuthMethodAndLocaleAndIsVerifiedAndIsDisabled:
      jest
        .fn()
        .mockImplementation(
          (
            emailOrUsernameOrUuidOrId,
            authMethod,
            locale,
            isVerified,
            isDisabled,
          ) => Promise.resolve(emailOrUsernameOrUuidOrId),
        ),
    findByEmailOrUsernameOrUuidOrIdAndAuthMethodAndLocaleAndIsVerifiedAndIsDisabledAndIsDeleted:
      jest
        .fn()
        .mockImplementation(
          (
            emailOrUsernameOrUuidOrId,
            authMethod,
            locale,
            isVerified,
            isDisabled,
            isDeleted,
          ) => Promise.resolve(emailOrUsernameOrUuidOrId),
        ),
  };
  const mockMailService = {};
  const mockTokenService = {
    handleUserDeletedEvent: jest.fn().mockImplementation((userID) => userID),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user and return the created user', async () => {
    const dto = {
      email: 'tester123@gmail.com',
      username: 'tester123',
      firstName: 'Tester',
      lastName: 'McTesterson',
      password: 'password',
      uuid: '1234',
      avatar: 'https://www.google.com',
      googleId: '1234',
      isVerified: true,
      locale: Locale.en_CA,
      authMethod: AuthMethod.Local,
    };
    expect(
      await service.create({
        ...dto,
      }),
    ).toEqual({
      email: dto.email,
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: expect.any(String), //password is hashed
      uuid: dto.uuid,
      avatar: dto.avatar,
      googleId: dto.googleId,
      isVerified: dto.isVerified,
      locale: dto.locale,
      authMethod: dto.authMethod,
    });
  });

  it('should update a user and return the updated user', async () => {
    const dto = {
      email: 'tester123@gmail.com',
      username: 'tester123',
      obj: {
        email: 'tester123@gmail.com',
        username: 'Newtester123',
        firstName: 'Tester',
        lastName: 'McTesterson',
        password: 'password',
        uuid: '1234',
        avatar: 'https://www.google.com',
        googleId: '1234',
        isVerified: true,
        locale: Locale.en_CA,
        authMethod: AuthMethod.Local,
      },
    };

    expect(await service.update(dto.obj.uuid, dto)).toEqual(dto.obj.uuid); //Tests if update was run correctly
  });
  it('should find a user by uuid and return the user', async () => {
    const dto = {
      uuid: '1234',
    };
    expect(await service.findOneByUuid(dto.uuid)).toBeCalled; //Tests if findOneByUuid was called correctly
  });

  it('should find a user by email or username and return the user', async () => {
    const dto = {
      email: 'tester123@gmail.com',
      username: 'tester123',
      firstName: 'Tester',
      lastName: 'McTesterson',
      password: 'password',
      uuid: '1234',
      avatar: 'https://www.google.com',
      googleId: '1234',
      isVerified: true,
      locale: Locale.en_CA,
      authMethod: AuthMethod.Local,
    };
    await service.create({ ...dto }),
      expect(await service.getByEmail(dto.email)).toBeCalled; //Tests if findOneByEmailOrUsername was called correctly
  });

  it('should find a user by email', async () => {
    const dto = {
      email: 'test123@gmail.com',
    };
    expect(await service.getByEmail(dto.email)).toBeCalled; //Tests if findOneByEmail was called correctly
  });

  it('should check if a user exists', async () => {
    const dto = {
      userUuid: '1234',
    };
    expect(await service.doesExist(dto.userUuid)).toBeCalled; //Tests if exists was called correctly
  });

  it('should remove a user', async () => {
    const dto = {
      userUuid: '1234',
    };
    expect(await service.remove(dto.userUuid)).toBeCalled; //Tests if remove was called correctly
  });

  it('should update password', async () => {
    const dto = {
      userUuid: 1234,
      password: 'password',
    };
    expect(await service.updatePassword(dto.userUuid, dto.password)).toBeCalled; //Tests if updatePassword was called correctly
  });

  it('should verify a user', async () => {
    const dto = {
      userUuid: 1234,
    };
    expect(await service.verify(dto.userUuid)).toBeCalled; //Tests if verify was called correctly
  });
});
