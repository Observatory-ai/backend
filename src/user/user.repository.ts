import { DateUtil } from '../utils/date.util';
import { EntityRepository, LessThanOrEqual, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BadRequestException } from '@nestjs/common';
import { EmailInUseException } from 'src/exception/email-in-use.exception';
import { UsernameInUseException } from 'src/exception/username-in-use.exception';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findByUuid(userUuid: string): Promise<User | undefined> {
    return await this.findOne({ where: { uuid: userUuid } });
  }

  async findById(userId: number): Promise<User | undefined> {
    return await this.findOne({ where: { id: userId } });
  }

  async findByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<User | undefined> {
    return await this.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } },
    );
  }

  async createAndSave(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, birthday, uuid, isVerified } =
      createUserDto;
    let user = new User();
    user.email = email;
    user.username = username;
    user.password = password;
    user.birthday = birthday;
    user.uuid = uuid;
    user.isVerified = isVerified;
    user.isActive = true;

    try {
      return await this.save(user);
    } catch (err) {
      if (err.code === '23505') {
        if (err.detail.includes('(email)=')) {
          throw new EmailInUseException();
        } else if (err.detail.includes('(username)=')) {
          throw new UsernameInUseException();
        } else {
          // uuid duplication (highly improbable)
          throw new BadRequestException();
        }
      }
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const result = await this.createQueryBuilder()
      .update(User)
      .set({
        ...updateUserDto,
      })
      .where('uuid = :uuid', { uuid: userId })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async updateRefreshToken(
    emailOrUsername: string,
    refreshToken: string,
  ): Promise<User> {
    const result = await this.createQueryBuilder()
      .update(User)
      .set({
        refreshToken,
      })
      .where('email = :emailOrUsername', { emailOrUsername })
      .orWhere('username = :emailOrUsername', { emailOrUsername })
      .returning('*')
      .execute();
    return result.raw[0];
  }

  async updatePassword(userId: number, password: string): Promise<void> {
    await this.createQueryBuilder()
      .update(User)
      .set({
        password,
      })
      .where('id = :id', { id: userId })
      .execute();
  }

  async verifyUser(userId: number): Promise<void> {
    await this.createQueryBuilder()
      .update(User)
      .set({
        isVerified: true,
      })
      .where('id = :id', { id: userId })
      .execute();
  }

  async deleteUser(userId: string): Promise<number> {
    const result = await this.createQueryBuilder()
      .delete()
      .from(User)
      .where({ uuid: userId })
      .execute();

    return result.affected;
  }

  async clearRefreshToken(email: string): Promise<void> {
    await this.createQueryBuilder()
      .update(User)
      .set({
        refreshToken: null,
      })
      .where('email = :email', { email })
      .execute();
  }
}
