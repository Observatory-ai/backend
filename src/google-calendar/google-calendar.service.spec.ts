import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarService } from './google-calendar.service';
import { ConfigService } from '@nestjs/config';
import { ServiceIntegrationService } from '../service-integration/service-integration.service';
import { UserModule } from 'src/user/user.module';
import { User } from '../user/user.entity';
import { Request as ExpressRequest } from 'express';
import { Locale } from '../user/enum/locale.enum';
import { AuthMethod } from '../user/enum/auth-method.enum';
import { UserService } from '../user/user.service';

describe('GoogleCalendarService', () => {
  let service: GoogleCalendarService;
 
  const userdto = {
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
  let user = new User();
  user.email = userdto.email;
  const mockRequest = {
    res: {
      redirect: jest.fn(),
    },
  } as unknown as ExpressRequest;
  mockRequest.res.redirect = jest.fn();
  const mockGoogleCalendarService = {
    requestService: jest.fn().mockImplementation((user, request) => Promise.resolve(user)),
    activateService: jest.fn().mockImplementation((user, request) => Promise.resolve(user)),
  };
  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => key),
  };
  const mockIntegrationService = {
    getService: jest.fn().mockImplementation((useris, service) => Promise.resolve(user)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCalendarService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ServiceIntegrationService,
          useValue: mockIntegrationService,
        },
      ],
    }).compile();

    service = module.get<GoogleCalendarService>(GoogleCalendarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should request service',async () => {
    //Need to mock the request object to avoid making actual requests
    const userdto = {
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
    let user = new User();
    user.email = userdto.email;
    expect(await service.requestService( user, mockRequest));
  });

  it('should activate the service',async () => {
    //Need to mock the request object to avoid making actual requests
    expect(await mockGoogleCalendarService.activateService(user, mockRequest ));

  });

  it('should get calendar events',async () => {
    //Need to mock the request object to avoid making actual requests
    try{
       await service.getCalendarEvents(user);
    } catch(e){
      //This should fail because there is no API defined, nor tokens
      expect(e).toBeDefined();
    }
  });

  it('should set google client tokens',async () => {
      const refresh_token = '1234';
      const access_token = '12345';
      expect(await service.setGoogleClientTokens(refresh_token, access_token)).toBeCalled;
  });

  it('should get the google calendar events on the main calendar',async () => {
    try{
      await service.getUserCalendarEvents();
   } catch(e){
     //This should fail because there is no API defined, nor tokens or refresher callback
     expect(e).toBeDefined();
   }
  });

});
