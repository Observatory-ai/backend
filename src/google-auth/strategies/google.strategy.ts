import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config, GoogleConfig } from '../../config/configuration.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService<Config>) {
    super({
      clientID: configService.get<GoogleConfig>('google').authClientId,
      clientSecret: configService.get<GoogleConfig>('google').authClientSecret,
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/user.birthday.read',
        'https://www.googleapis.com/auth/user.gender.read',
      ],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = {
      profile,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
