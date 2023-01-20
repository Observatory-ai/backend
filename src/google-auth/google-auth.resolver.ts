import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserResponseDto } from '../auth/models/user-response.model';
import { ExecutionContext } from '../utils/requests.interface';
import { GoogleAuthDto } from './dtos/google-auth.dto';
import { GoogleAuthService } from './google-auth.service';

@Resolver()
export class GoogleAuthResolver {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Mutation(() => UserResponseDto)
  authenticateWithGoogle(
    @Args('GoogleAuthInput') googleAuthDto: GoogleAuthDto,
    @Context() request: ExecutionContext,
  ): Promise<UserResponseDto> {
    return this.googleAuthService.authenticate(googleAuthDto, request.req);
  }
}
