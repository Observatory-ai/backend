import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), TokenModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
