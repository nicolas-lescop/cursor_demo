import { Module } from '@nestjs/common';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthService } from './application/auth.service';
import { DrizzleUserRepository } from './infrastructure/repositories/drizzle-user.repository';
import { DrizzleRefreshTokenRepository } from './infrastructure/repositories/drizzle-refresh-token.repository';
import { USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY } from './domain/user/user.repository.port';
import { JwtAuthGuard } from './infrastructure/auth/jwt.guard';

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtAuthGuard,
        {
            provide: USER_REPOSITORY,
            useClass: DrizzleUserRepository,
        },
        {
            provide: REFRESH_TOKEN_REPOSITORY,
            useClass: DrizzleRefreshTokenRepository,
        },
    ],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
