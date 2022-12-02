import { ServiceUnavailableException } from '@nestjs/common';
import { EntityRepository, LessThan, Repository } from 'typeorm';
import { DateUtil } from '../utils/date.util';
import { AuthToken } from './auth-token.entity';
import {
  AuthTokenType,
  CookieConfig,
  COOKIE_CONFIG,
} from './configs/cookie.config';
import { CreateAuthTokenDto } from './dtos/create-auth-token.dto';
import { UpdateAuthTokenDto } from './dtos/update-auth-token.dto';

@EntityRepository(AuthToken)
export class AuthTokenRepository extends Repository<AuthToken> {
  private readonly refreshCookieConfig: CookieConfig =
    COOKIE_CONFIG[AuthTokenType.Refresh];

  async getAuthTokensByUserId(userId: number): Promise<AuthToken[]> {
    return await this.find({ where: { userId: userId } });
  }

  async findAuthToken(
    refreshToken: string,
    userId: number,
  ): Promise<AuthToken | undefined> {
    return await this.findOne({ refreshToken, userId });
  }

  async deleteAuthTokensByUserId(userId: number): Promise<void> {
    await this.delete({ userId });
  }

  async deleteAuthTokenByRefreshToken(refreshToken: string): Promise<void> {
    await this.delete({ refreshToken });
  }

  async updateAuthToken(
    authTokenId,
    updateAuthTokenDto: UpdateAuthTokenDto,
  ): Promise<AuthToken> {
    const result = await this.createQueryBuilder()
      .update(AuthToken)
      .set({
        ...updateAuthTokenDto,
      })
      .where('id = :id', { id: authTokenId })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async createAuthToken(
    createAuthTokenDto: CreateAuthTokenDto,
  ): Promise<AuthToken> {
    const { userId, refreshToken, userAgent } = createAuthTokenDto;
    let authToken = new AuthToken();
    authToken.userId = userId;
    authToken.refreshToken = refreshToken;
    authToken.userAgent = userAgent;

    try {
      return await this.save(authToken);
    } catch (err) {
      throw new ServiceUnavailableException();
    }
  }

  async deleteExpiredAuthTokens(): Promise<number> {
    const oneWeek: Date = DateUtil.removeDays(
      new Date(),
      this.refreshCookieConfig.expirationTime / 60 / 60 / 24,
    );
    const result = await this.createQueryBuilder()
      .delete()
      .from(AuthToken)
      .where({ updatedAt: LessThan(oneWeek) })
      .execute();

    return result.affected;
  }
}
