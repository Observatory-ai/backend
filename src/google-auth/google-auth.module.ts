import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';

@Module({
  providers: [GoogleAuthService],
  controllers: [GoogleAuthController],
  imports: [UserModule],
})
export class GoogleAuthModule {}
