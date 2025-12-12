import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './infrastructure/database/drizzle.module';
import { PromptController } from './infrastructure/controllers/prompt.controller';
import { PromptService } from './application/prompt.service';
import { DrizzlePromptRepository } from './infrastructure/repositories/drizzle-prompt.repository';
import { PROMPT_REPOSITORY } from './domain/prompt/prompt.repository.port';
import { AuthModule } from './auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DrizzleModule,
        AuthModule,
    ],
    controllers: [PromptController],
    providers: [
        PromptService,
        {
            provide: PROMPT_REPOSITORY,
            useClass: DrizzlePromptRepository,
        },
    ],
})
export class AppModule {}
