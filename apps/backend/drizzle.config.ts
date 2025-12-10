import type { Config } from 'drizzle-kit';

export default {
    schema: './src/infrastructure/database/schema.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/prompts_db',
    },
} satisfies Config;
