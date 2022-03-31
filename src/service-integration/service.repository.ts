import { EntityRepository, Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';

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
}