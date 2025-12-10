import { Inject, Injectable } from '@nestjs/common';
import { PromptRepositoryPort } from '../../domain/prompt/prompt.repository.port';
import { Prompt } from '../../domain/prompt/prompt.entity';
import { DRIZZLE } from '../database/drizzle.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { eq, ilike, desc, and } from 'drizzle-orm';

@Injectable()
export class DrizzlePromptRepository implements PromptRepositoryPort {
    constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>) { }

    async findAll(filters?: { isFavorite?: boolean }): Promise<Prompt[]> {
        const conditions = [];
        if (filters?.isFavorite) {
            conditions.push(eq(schema.prompts.isFavorite, true));
        }

        const rows = await this.db.select().from(schema.prompts)
            .where(and(...conditions))
            .orderBy(desc(schema.prompts.createdAt));
        return rows.map(this.toDomain);
    }

    async findById(id: number): Promise<Prompt | null> {
        const rows = await this.db.select().from(schema.prompts).where(eq(schema.prompts.id, id));
        if (rows.length === 0) return null;
        return this.toDomain(rows[0]);
    }

    async create(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
        const rows = await this.db.insert(schema.prompts).values({
            title: prompt.title,
            content: prompt.content,
            isFavorite: prompt.isFavorite,
        }).returning();
        return this.toDomain(rows[0]);
    }

    async update(id: number, prompt: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Prompt> {
        const rows = await this.db.update(schema.prompts)
            .set({
                ...prompt,
                updatedAt: new Date(),
            })
            .where(eq(schema.prompts.id, id))
            .returning();
        return this.toDomain(rows[0]);
    }

    async delete(id: number): Promise<void> {
        await this.db.delete(schema.prompts).where(eq(schema.prompts.id, id));
    }

    async search(query: string): Promise<Prompt[]> {
        const rows = await this.db.select().from(schema.prompts)
            .where(ilike(schema.prompts.title, `%${query}%`))
            .orderBy(desc(schema.prompts.createdAt));
        return rows.map(this.toDomain);
    }

    private toDomain(row: typeof schema.prompts.$inferSelect): Prompt {
        return new Prompt(
            row.id,
            row.title,
            row.content,
            row.isFavorite ?? false,
            row.createdAt || new Date(),
            row.updatedAt || new Date(),
        );
    }
}
