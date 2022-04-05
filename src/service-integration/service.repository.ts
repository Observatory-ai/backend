import { EntityRepository, Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceType } from './enum/service-type.enum';

@EntityRepository(Service)
export class ServiceRepository extends Repository<Service> {
  async createAndSave(createServiceDto: CreateServiceDto): Promise<Service> {
    const { service, refreshToken, userId, apis, isActive } = createServiceDto;
    let newService = new Service();
    newService.service = service;
    newService.refreshToken = refreshToken;
    newService.userId = userId;
    newService.apis = apis;
    newService.isActive = isActive;

    try {
      return await this.save(newService);
    } catch (err) {
      // TODO: throw error
      return undefined;
    }
  }

  async findByUserIdAndServiceType(
    userId: number,
    serviceType: ServiceType,
  ): Promise<Service | undefined> {
    return await this.findOne({
      where: { userId: userId, service: serviceType },
    });
  }

  async updateRefreshToken(serviceType, userId, refreshToken): Promise<void> {
    const result = await this.createQueryBuilder()
      .update(Service)
      .set({
        refreshToken,
      })
      .where('userId = :userId', { userId })
      .andWhere('service = :serviceType', { serviceType })
      .execute();
  }

  async updateRefreshTokenAndApis(
    serviceType,
    userId,
    refreshToken,
    apis,
  ): Promise<void> {
    const result = await this.createQueryBuilder()
      .update(Service)
      .set({
        refreshToken,
        apis,
      })
      .where('userId = :userId', { userId })
      .andWhere('service = :serviceType', { serviceType })
      .execute();
  }
}
