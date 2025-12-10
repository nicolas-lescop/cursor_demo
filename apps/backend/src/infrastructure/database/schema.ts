import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const prompts = pgTable('prompts', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    isFavorite: boolean('is_favorite').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
