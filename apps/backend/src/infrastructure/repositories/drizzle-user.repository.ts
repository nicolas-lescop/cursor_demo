import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { UserRepositoryPort } from '../../domain/user/user.repository.port';
import { User } from '../../domain/user/user.entity';
import { users } from '../database/schema';

@Injectable()
export class DrizzleUserRepository implements UserRepositoryPort {
    constructor(
        @Inject('DRIZZLE_DB')
        private readonly db: PostgresJsDatabase,
    ) {}

    async findById(id: number): Promise<User | null> {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (result.length === 0) return null;

        return this.mapToEntity(result[0]);
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (result.length === 0) return null;

        return this.mapToEntity(result[0]);
    }

    async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
        const result = await this.db
            .insert(users)
            .values({
                email: user.email,
                passwordHash: user.passwordHash,
                displayName: user.displayName,
            })
            .returning();

        return this.mapToEntity(result[0]);
    }

    private mapToEntity(row: typeof users.$inferSelect): User {
        return {
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            displayName: row.displayName,
            createdAt: row.createdAt ?? new Date(),
        };
    }
}
