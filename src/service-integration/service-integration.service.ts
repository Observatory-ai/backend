import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceType } from './enum/service-type.enum';
import { Service } from './service.entity';
import { ServiceRepository } from './service.repository';

@Injectable()
export class ServiceIntegrationService {
  constructor(
    @InjectRepository(ServiceRepository)
    private readonly serviceRepository: ServiceRepository,
  ) {}

  /**
   * Create a user
   * @param createServiceDto the user to create
   * @returns the created service
   */
  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const createdService: Service = await this.serviceRepository.createAndSave(
      createServiceDto,
    );
    return createdService;
  }

  /**
   * Get the refresh token for a service
   * @param userId the user id
   * @param service the service requested
   * @returns the refresh token for that service and user combination
   */
  async getServiceRefreshToken(
    userId: number,
    service: ServiceType,
  ): Promise<Service> {
    const createdService: Service =
      await this.serviceRepository.findByUserIdAndServiceType(userId, service);
    return createdService;
  }
}
