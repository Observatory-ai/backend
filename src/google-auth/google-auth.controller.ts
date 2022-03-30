import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleAuthService } from './google-auth.service';
import { Request as ExpressRequest } from 'express';
import GoogleGuard from './guards/google.guard';
import { ReqUser } from '../decorators/user.decorator';
import { GoogleUserDto } from './dtos/google-user.dto';
import { UserResponseDto } from '../auth/dtos/responses/user-response.dto';

@Controller('api/auth')
@ApiTags('Google Authentication')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth(@Request() request: ExpressRequest) {}

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  googleAuthRedirect(
    @Request() request: ExpressRequest,
    @ReqUser() user: GoogleUserDto,
  ): Promise<UserResponseDto> {
    return this.googleAuthService.authenticate(user, request.res);
  }
}
