import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { VerifyAccountDto } from 'src/auth/dtos/verify-account.dto';
import { TokenType } from './enum/token-type.enum';
import { Token } from './token.entity';

describe('TokenService', () => {
  let service: TokenService;

  const mockTokenRepository = {
    createAndSave: jest.fn().mockImplementation((dto) => Promise.resolve(dto)),
    findByUuid: jest.fn().mockImplementation((uuid) => Promise.resolve(uuid)),
    deleteByUuid: jest.fn().mockImplementation((uuid) => Promise.resolve(uuid)),
    removeAllUserTokens: jest
      .fn()
      .mockImplementation((userId) => Promise.resolve(userId)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: TokenRepository,
          useValue: mockTokenRepository,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a token', async () => {
    const dto = {
      uuid: 'uuid',
      userId: 1234,
      type: TokenType.VerifyAccount,
      expiresAt: new Date(),
    };
    let token: Token;
    token = new Token();
    token = await mockTokenRepository.createAndSave(dto);
    expect(token).toEqual(dto);
  });

  it('should find a token by tokenUuid', async () => {
    const tokenUuid = 'tokenUuid';
    let token: Token;
    token = await mockTokenRepository.findByUuid(tokenUuid);
    expect(token).toEqual(token);
  });

  it('should remove a token using the Uuid', async () => {
    const tokenUuid = 'tokenUuid';
    let token: Token;
    token = await mockTokenRepository.deleteByUuid(tokenUuid);
    expect(token).toEqual(token);
  });

  it('should remove all tokens from a user', async () => {
    const userId = '1234';
    let token: Token;
    token = await mockTokenRepository.removeAllUserTokens(userId);
    expect(token).toEqual(token);
  });
});
