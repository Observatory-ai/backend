import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceIntegrationService } from './service-integration.service';
import { ServiceRepository } from './service.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRepository])],
  providers: [ServiceIntegrationService],
})
export class ServiceIntegrationModule {}
