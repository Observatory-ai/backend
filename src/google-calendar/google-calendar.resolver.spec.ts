import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarResolver } from './google-calendar.resolver';

describe('GoogleCalendarResolver', () => {
  let resolver: GoogleCalendarResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCalendarResolver],
    }).compile();

    resolver = module.get<GoogleCalendarResolver>(GoogleCalendarResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
