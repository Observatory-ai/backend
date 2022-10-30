import { Api } from '../enum/api.enum';
import { ServiceType } from '../enum/service-type.enum';

export class CreateServiceDto {
  service: ServiceType;

  refreshToken: string;

  userId: number;

  apis: Api[];

  isActive: boolean;
}
