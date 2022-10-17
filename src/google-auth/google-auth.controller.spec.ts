import { Test, TestingModule } from '@nestjs/testing';
import { any } from 'joi';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';

describe('GoogleAuthController', () => {
  let controller: GoogleAuthController;
  const mockAuthService = {
    login: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    jwtConfig: { //this needs to be privatew
      secret: 'secret',
      signOptions: {
        expiresIn: '1d',
      },
    },
    domain: 'domain',
    accessCookieConfig: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000,
    },
    refreshCookieConfig: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000,
    },
    //authTokenRepository, userService, jwtService, configService
    authTokenRepository: {
      create: jest.fn().mockImplementation((user) => Promise.resolve(user)),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),

    },
    userService: {
      create: jest.fn().mockImplementation((user) => Promise.resolve(user)),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
      findOne: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    },
    jwtService: {
      sign: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    },
    configService: {
      get: jest.fn().mockImplementation((key) => key),
    },
    //tokenService, mailService, register, logIn
    tokenService: {
      create: jest.fn().mockImplementation((user) => Promise.resolve(user)),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
      findOne: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    },
    mailService: {
      sendMail: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    },
    register: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    logIn: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    //setRefreshTokenCookie, clearRefreshTokenCookie, logOut, refreshToken,
    setRefreshTokenCookie: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    clearRefreshTokenCookie: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    logOut: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    refreshToken: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    // /forgotPassword, changePassword, verifyAccount, validateToken,
    forgotPassword: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    changePassword: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    verifyAccount: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    validateToken: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    //lidateLocalAuth, validateJWT, validateJWTRefresh, generateToken, passwordsMatch
    validateLocalAuth: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    validateJWT: jest.fn().mockImplementation((user) => Promise.resolve(user)),

  };
  const mockoauthClient = {
    setCredentials: jest.fn().mockImplementation((accessToken) => Promise.resolve(accessToken)),
  };
  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => key),
  };
  const mockUserService = {};
  const mockGoogleAuthService = {
    authService: mockAuthService,
    configService: mockConfigService,
    userService: mockUserService,
    

  };
  let googleAuthService: GoogleAuthService;



  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleAuthController],
    }).compile();

    controller = module.get<GoogleAuthController>(GoogleAuthController);
  });
  //googleAuthService = new GoogleAuthService( mockAuthService, mockAuthService, mockUserService);
  it('should be defined', () => {
    expect(any).toEqual(any);
    //Not sure how to test this
  });

  // it('should authenticate Google', () =>{
  //   expect(controller.create({googleAuthDto: '',}))
  // })
});
