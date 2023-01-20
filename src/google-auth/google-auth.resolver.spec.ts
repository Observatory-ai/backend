import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthResolver } from './google-auth.resolver';

describe('GoogleAuthResolver', () => {
  let resolver: GoogleAuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleAuthResolver],
    }).compile();

    resolver = module.get<GoogleAuthResolver>(GoogleAuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
