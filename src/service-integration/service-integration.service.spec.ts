import { Test, TestingModule } from '@nestjs/testing';
import { ServiceIntegrationService } from './service-integration.service';

describe('ServiceIntegrationService', () => {
  let service: ServiceIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceIntegrationService],
    }).compile();

    service = module.get<ServiceIntegrationService>(ServiceIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
