import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenService } from '../token/token.service';
import { DateUtil } from '../utils/date.util';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { Token } from '../token/token.entity';
import { TokenType } from '../token/enum/token-type.enum';
import { User } from './user.entity';
import {
  UserNotFoundException,
  UserWithIdNotFoundException,
} from '../exception/user-not-found.exception';
import { AccountDisabledException } from '../exception/account-disabled.exception';
import { AccountNotVerifiedException } from '../exception/account-not-verified.exception';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserTokenDto } from '../mail/dto/user-token.dto';
import { MailService } from '../mail/mail.service';
import { CreateTokenDto } from '../token/dto/create-token.dto';
import { v4 } from 'uuid';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Create a user
   * @param createUserDto the user to create
   * @param role the users role
   * @param verify verify the user
   * @returns the created user document
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await this.hash(createUserDto.password);
    const createdUser: User = await this.userRepository.createAndSave(
      createUserDto,
    );
    let verifyAccountToken: Token;
    if (!createdUser.isVerified) {
      verifyAccountToken = await this.createVerifyAccountToken(createdUser);
    }
    const userToken: UserTokenDto = {
      user: createdUser,
      token: verifyAccountToken.uuid,
    };
    this.mailService.handleUserCreated(userToken);
    return createdUser;
  }

  /**
   * Find all users
   * @returns an array of user documents
   */
  async findAll(): Promise<User[]> {
    const users: User[] = await this.userRepository.find();
    return users;
  }

  /**
   * Find a user by uuid
   * @param userUuid the users uuid
   * @throws UserWithIdNotFoundException
   * @returns a user document
   */
  async findOneByUuid(userUuid: string): Promise<User> {
    const user: User = await this.userRepository.findByUuid(userUuid);
    if (!user) throw new UserWithIdNotFoundException(userUuid);
    return user;
  }

  async findOneById(userId: number): Promise<User> {
    const user: User = await this.userRepository.findById(userId);
    if (!user) throw new UserWithIdNotFoundException(userId);
    return user;
  }

  /**
   * Find a user by email or username
   * @param emailOrUsername the users email or username
   * @param checkEnabledAndVerified check if the user is enabled and verified
   * @throws UserNotFoundException
   * @throws AccountDisabledException
   * @throws AccountNotVerifiedException
   * @returns a user
   */
  async findByEmailOrUsername(emailOrUsername: string): Promise<User> {
    const user: User = await this.userRepository.findByUsernameOrEmail(
      emailOrUsername,
    );
    if (!user) throw new UserNotFoundException(emailOrUsername);
    if (!user.isActive) throw new AccountDisabledException(emailOrUsername);
    // if (!user.isVerified) throw new AccountNotVerifiedException(emailOrUsername);
    return user;
  }

  /**
   * Find a user by email
   * @param email the users email
   * @param checkEnabledAndVerified check if the user is enabled and verified
   * @throws UserNotFoundException
   * @throws AccountDisabledException
   * @throws AccountNotVerifiedException
   * @returns a user
   */
  async findByEmail(email: string): Promise<User> {
    const user: User = await this.userRepository.findByUsernameOrEmail(email);
    if (!user) throw new UserNotFoundException(email);
    if (!user.isActive) throw new AccountDisabledException(email);
    // if (!user.isVerified) throw new AccountNotVerifiedException(email);
    return user;
  }

  /**
   * Find a user by email and refresh token
   * @param email the users email
   * @param refreshToken the users latest refresh token
   * @returns a user
   */
  async findByEmailAndRefreshToken(
    email: string,
    refreshToken: string,
  ): Promise<User> {
    const user: User = await this.findByEmail(email);
    if (!user.refreshToken) return;
    const refreshTokensMatch: boolean = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (refreshTokensMatch) return user;
  }

  /**
   * Checks whether a user exists or not
   * @param userId the users uuid
   * @throws UserWithIdNotFoundException
   */
  async doesExist(userId: string): Promise<void> {
    const user: User = await this.userRepository.findByUuid(userId);
    if (!user) throw new UserWithIdNotFoundException(userId);
  }

  /**
   * Update a user
   * @param userId the users uuid
   * @param updateUserDto the updated user
   * @returns the updated user document
   */
  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user: User = await this.userRepository.updateUser(
      userId,
      updateUserDto,
    );
    return user;
  }

  /**
   * Delete a user
   * @param userId the users uuid
   */
  async remove(userId: string): Promise<void> {
    await this.userRepository.deleteUser(userId);
    this.tokenService.handleUserDeletedEvent(userId);
  }

  /**
   * Update a users latest refresh token
   * @param email the users email
   * @param refreshToken the users latest refresh token
   */
  async updateRefreshToken(
    emailOrUsername: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken: string = await this.hash(refreshToken);
    await this.userRepository.updateRefreshToken(
      emailOrUsername,
      hashedRefreshToken,
    );
  }

  /**
   * Clear a users refresh token
   * @param email the users email
   */
  async clearRefreshToken(email: string): Promise<void> {
    await this.userRepository.clearRefreshToken(email);
  }

  /**
   * Update a users password
   * @param userId the users uuid
   * @param password the users new password
   */
  async updatePassword(userId: number, password: string): Promise<void> {
    const hashedPassword: string = await this.hash(password);
    await this.userRepository.updatePassword(userId, hashedPassword);
  }

  /**
   * Verify a user
   * @param userId the users id
   */
  async verify(userId: number): Promise<void> {
    await this.userRepository.verifyUser(userId);
  }

  /**
   * Create an account verification token
   * @param user the users details
   * @returns the created token document
   */
  private async createVerifyAccountToken(user: User): Promise<Token> {
    const uuid = v4();
    const createToken: CreateTokenDto = {
      uuid: uuid,
      userId: user.id,
      type: TokenType.VerifyAccount,
      expiresAt: DateUtil.addDays(new Date()),
    };
    return await this.tokenService.create(createToken);
  }

  /**
   * Generates a hash for the given value
   * @param value the value to hash
   * @returns the hashed value of the given string
   */
  private async hash(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }

  /**
   * Cron job that runs every hour and deletes stale
   * users (users that have not verified their accounts
   * in 24 hours)
   */
  // @Cron(CronExpression.EVERY_12_HOURS)
  // private async deleteStaleUsersJob(): Promise<void> {
  //   this.logger.log('Delete stale users cron job running');
  //   let deletedCount = 0;
  //   const yesterday: Date = DateUtil.removeDays(new Date());
  //   const staleUsers: User[] = await this.userRepository
  //     .find()
  //     .where('isVerified')
  //     .equals(false)
  //     .where('createdAt')
  //     .lte(yesterday.getTime())
  //     .exec();
  //   for (const staleUser of staleUsers) {
  //     await this.remove(staleUser._id);
  //     deletedCount++;
  //   }
  //   this.logger.log(
  //     `Delete stale users cron job finished - ${deletedCount} stale users deleted`,
  //   );
  // }
}
