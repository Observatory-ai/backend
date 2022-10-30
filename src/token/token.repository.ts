import { EntityRepository, LessThanOrEqual, Repository } from 'typeorm';
import { DateUtil } from '../utils/date.util';
import { CreateTokenDto } from './dtos/create-token.dto';
import { Token } from './token.entity';

@EntityRepository(Token)
export class TokenRepository extends Repository<Token> {
  async removeAllUserTokens(userId: string): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(Token)
      .where('userId = :userId', { userId })
      .execute();
  }

  async findByUuid(tokenUuid: string): Promise<Token | undefined> {
    return await this.findOne({ where: { uuid: tokenUuid } });
  }

  async deleteByUuid(tokenUuid: string): Promise<boolean> {
    const result = await this.createQueryBuilder()
      .delete()
      .from(Token)
      .where('uuid = :tokenUuid', { tokenUuid })
      .execute();

    return !!result.affected && result.affected > 0;
  }

  async createAndSave(createTokenDto: CreateTokenDto): Promise<Token> {
    const { uuid, expiresAt, userId, type } = createTokenDto;
    let token = new Token();
    token.uuid = uuid;
    token.expiresAt = expiresAt;
    token.type = type;
    token.userId = userId;

    try {
      return await this.save(token);
    } catch (err) {
      // TODO: throw error
      return undefined;
    }
  }

  async deleteExpiredTokens(): Promise<number> {
    const yesterday: Date = DateUtil.removeDays(new Date());
    const result = await this.createQueryBuilder()
      .delete()
      .from(Token)
      .where({ expiresAt: LessThanOrEqual(yesterday) })
      .execute();

    return result.affected;
  }
}
