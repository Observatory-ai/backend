import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { UserResponseDto } from '../auth/dtos/responses/user-response.dto';
import { GoogleAuthDto } from './dtos/google-auth.dto';
import { GoogleAuthService } from './google-auth.service';

@Controller('api/auth')
@ApiTags('Google Authentication')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post('google/authenticate')
  authenticate(
    @Body() googleAuthDto: GoogleAuthDto,
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    return this.googleAuthService.authenticate(googleAuthDto, request);
  }
}
