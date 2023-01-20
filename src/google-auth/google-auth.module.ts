import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { GoogleAuthResolver } from './google-auth.resolver';
import { GoogleAuthService } from './google-auth.service';

@Module({
  providers: [GoogleAuthService, GoogleAuthResolver],
  imports: [UserModule],
})
export class GoogleAuthModule {}
