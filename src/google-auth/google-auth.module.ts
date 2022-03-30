import { Module } from '@nestjs/common';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';
import { UserModule } from '../user/user.module';

@Module({
  providers: [GoogleStrategy, GoogleAuthService],
  controllers: [GoogleAuthController],
  imports: [UserModule],
})
export class GoogleAuthModule {}
