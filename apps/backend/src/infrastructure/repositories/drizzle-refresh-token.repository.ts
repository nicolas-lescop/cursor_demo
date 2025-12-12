import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { RefreshTokenRepositoryPort } from '../../domain/user/user.repository.port';
import { RefreshToken } from '../../domain/user/user.entity';
import { refreshTokens } from '../database/schema';

@Injectable()
export class DrizzleRefreshTokenRepository implements RefreshTokenRepositoryPort {
    constructor(
        @Inject('DRIZZLE_DB')
        private readonly db: PostgresJsDatabase,
    ) {}

    async create(token: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken> {
        const result = await this.db
            .insert(refreshTokens)
            .values({
                userId: token.userId,
                tokenHash: token.tokenHash,
                expiresAt: token.expiresAt,
                revokedAt: token.revokedAt,
            })
            .returning();

        return this.mapToEntity(result[0]);
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const result = await this.db
            .select()
            .from(refreshTokens)
            .where(eq(refreshTokens.tokenHash, tokenHash))
            .limit(1);

        if (result.length === 0) return null;

        return this.mapToEntity(result[0]);
    }

    async revokeToken(id: string): Promise<void> {
        await this.db
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokens.id, id));
    }

    async revokeAllUserTokens(userId: number): Promise<void> {
        await this.db
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokens.userId, userId));
    }

    private mapToEntity(row: typeof refreshTokens.$inferSelect): RefreshToken {
        return {
            id: row.id,
            userId: row.userId,
            tokenHash: row.tokenHash,
            expiresAt: row.expiresAt,
            revokedAt: row.revokedAt,
            createdAt: row.createdAt ?? new Date(),
        };
    }
}
