import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { JwtAuthenticationGuard } from 'src/auth/guards/jwt-authentication.guard';
import { ReqUser } from '../decorators/user.decorator';
import { CurrentUserResponseDto } from './models/current-user-response.model';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => CurrentUserResponseDto)
  @UseGuards(JwtAuthenticationGuard)
  async currentUser(@ReqUser() user: User): Promise<User | null> {
    return await this.userService.findOneById(user.id);
  }
}
