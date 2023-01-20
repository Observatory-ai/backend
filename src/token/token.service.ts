import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenExpiredException } from '../exceptions/token-expired.exception';
import { TokenNotFoundException } from '../exceptions/token-not-found.exception';
import { CreateTokenDto } from './dtos/create-token.dto';
import { Token } from './token.entity';
import { TokenRepository } from './token.repository';

@Injectable()
export class TokenService {
  private readonly logger: Logger = new Logger(TokenService.name);

  constructor(
    @InjectRepository(TokenRepository)
    private readonly tokenRepository: TokenRepository,
  ) {}

  /**
   * Create a token
   * @param token the token to create
   * @returns the created token
   */
  async create(token: CreateTokenDto): Promise<Token> {
    const createdToken: Token = await this.tokenRepository.createAndSave(token);
    return createdToken.save();
  }

  /**
   * Find and remove a token with the given id
   * @param tokenUuid the token uuid
   * @throws TokenNotFoundException
   * @returns the deleted token
   */
  async findOneByUuid(tokenUuid: string): Promise<Token> {
    // add tokenType to check when looking for token
    const token: Token = await this.tokenRepository.findByUuid(tokenUuid);
    if (!token) throw new TokenNotFoundException(tokenUuid);
    return token;
  }

  async removeOneByUuid(tokenUuid: string): Promise<boolean> {
    return await this.tokenRepository.deleteByUuid(tokenUuid);
  }

  /**
   * Remove all tokens for the given user
   * @param userId the users id
   */
  private async removeAll(userId: string): Promise<void> {
    await this.tokenRepository.removeAllUserTokens(userId);
  }

  /**
   * Checks if a token is expired
   * @param token the token to check
   * @throws TokenExpiredException
   */
  isTokenExpired(token: Token): void {
    if (token.expiresAt < new Date()) {
      throw new TokenExpiredException(token.uuid);
    }
  }

  /**
   * Handles the user.deleted event
   * @param payload the user.deleted event payload
   */
  async handleUserDeletedEvent(userId: string): Promise<void> {
    await this.removeAll(userId);
  }

  /**
   * Cron job that runs every hour and deletes expired
   * tokens (tokens expire after 24 hours)
   */
  @Cron(CronExpression.EVERY_HOUR)
  private async deleteExpiredTokensJob(): Promise<void> {
    this.logger.log('Delete expired tokens cron job running');
    const deletedCount = await this.tokenRepository.deleteExpiredTokens();
    this.logger.log(
      `Delete expired tokens cron job finished - ${deletedCount} tokens deleted`,
    );
  }
}
