import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateServiceDto } from './dtos/create-service.dto';
import { Api } from './enum/api.enum';
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
   * @returns the service
   */
  async getService(userId: number, service: ServiceType): Promise<Service> {
    const createdService: Service =
      await this.serviceRepository.findByUserIdAndServiceType(userId, service);
    return createdService;
  }

  /**
   * Check if a service exists on a user
   * @param serviceType the service
   * @param userId the user's id
   * @returns a boolean indicating of the service exists on that user
   */
  async doesExists(serviceType: ServiceType, userId: number): Promise<boolean> {
    const service: Service =
      await this.serviceRepository.findByUserIdAndServiceType(
        userId,
        serviceType,
      );
    return !!service;
  }

  /**
   * Update the refresh token of a service on a user
   * @param serviceType the service
   * @param userId the user's id
   * @param refreshToken the new refresh token
   */
  async updateRefreshToken(
    serviceType: ServiceType,
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    await this.serviceRepository.updateRefreshToken(
      serviceType,
      userId,
      refreshToken,
    );
  }

  /**
   * Update the refresh token and API list of a service on a user
   * @param serviceType the service
   * @param userId the user's id
   * @param refreshToken the new refresh token
   * @param apis the new APIs array
   */
  async updateRefreshTokenAndApis(
    serviceType: ServiceType,
    userId: number,
    refreshToken: string,
    apis: Api[],
  ): Promise<void> {
    await this.serviceRepository.updateRefreshTokenAndApis(
      serviceType,
      userId,
      refreshToken,
      apis,
    );
  }
}
