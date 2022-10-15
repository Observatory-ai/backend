import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {AuthMethod} from './enum/auth-method.enum';
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
  createAndSave: jest.fn().mockImplementation(dto => dto),
  updateUser: jest.fn().mockImplementation(user => Promise.resolve(user)),
 }
 const mockMailService={}
 const mockTokenService={}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, {
        provide: UserRepository,
        useValue: mockUserRepository,
      }, {
        provide: MailService,
        useValue: mockMailService,
      },{
        provide: TokenService,
        useValue: mockTokenService,
      }],
      

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
    expect(await service.create({
      ...dto,
    })).toEqual({
      email: dto.email,
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: expect.any(String),//password is hashed
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
      obj:{
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
      }
    };
    expect(await service.update(dto.obj.uuid, dto)).toEqual(dto.obj.uuid); //Tests if update was run correctly    

  });
});
