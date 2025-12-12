import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, UsePipes } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import {
    RegisterSchema,
    RegisterDto,
    LoginSchema,
    LoginDto,
    RefreshSchema,
    RefreshDto,
    LogoutSchema,
    LogoutDto,
    AuthResponseDto,
    TokenRefreshResponseDto,
    UserDto,
} from '@app/shared';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UsePipes(new ZodValidationPipe(RegisterSchema))
    async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(LoginSchema))
    async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(RefreshSchema))
    async refresh(@Body() dto: RefreshDto): Promise<TokenRefreshResponseDto> {
        return this.authService.refresh(dto.refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UsePipes(new ZodValidationPipe(LogoutSchema))
    async logout(@Body() dto: LogoutDto): Promise<void> {
        await this.authService.logout(dto.refreshToken);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@CurrentUser() user: CurrentUserPayload): Promise<UserDto> {
        const currentUser = await this.authService.getCurrentUser(user.id);
        if (!currentUser) {
            throw new Error('User not found');
        }
        return currentUser;
    }
}
