import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { GoogleAuthService } from './google-auth.service';
import { Request as ExpressRequest } from 'express';
import { Auth } from 'googleapis';

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;


  const mockUserService = {};
  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => key),
  };

  
  const mockRequest = {
    res: {
      redirect: jest.fn(),
    },
  } as unknown as ExpressRequest;
  mockRequest.res.redirect = jest.fn();

  const mockAuthService = {
    login: jest.fn().mockImplementation((user) => Promise.resolve(user)),
  };

  const mockoauthClient = {
    setCredentials: jest.fn().mockImplementation((accessToken) => Promise.resolve(accessToken)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleAuthService,
      {
        provide: AuthService,
        useValue: mockAuthService,
      },
      {
        provide: UserService,
        useValue: mockUserService,
      },
      {
        provide: ConfigService,
        useValue: mockConfigService,
      },
      {
        provide: Auth.OAuth2Client,
        useValue: mockoauthClient,
      },
    ],
      
    }).compile();

    service = module.get<GoogleAuthService>(GoogleAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set the google client access token', async () => {
    const accessToken = '12432';
    expect(service.setGoogleClientAccessToken(accessToken)).toBeCalled;
  });

  it('should authenticate', async () => {
    const googleauthDto={
      accessToken: 'gfd78fsdagfds',
    };
    try{
      await service.authenticate(googleauthDto, mockRequest);
    }catch(e){
      //SHould throw a required crendital error because invalid access token
      expect(e).toBeDefined();
    }

  });
});
