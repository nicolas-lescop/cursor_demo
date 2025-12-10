import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';

@Global()
@Module({
    providers: [
        {
            provide: DRIZZLE,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const connectionString = configService.get<string>('DATABASE_URL') || 'postgres://user:password@localhost:5432/prompts_db';
                const client = postgres(connectionString);
                return drizzle(client, { schema });
            },
        },
    ],
    exports: [DRIZZLE],
})
export class DrizzleModule { }
