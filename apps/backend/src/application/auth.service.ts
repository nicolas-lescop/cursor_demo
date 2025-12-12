import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UserRepositoryPort, USER_REPOSITORY, RefreshTokenRepositoryPort, REFRESH_TOKEN_REPOSITORY } from '../domain/user/user.repository.port';
import { User } from '../domain/user/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto, TokenRefreshResponseDto, UserDto } from '@app/shared';

// Simple JWT implementation without external dependencies
interface JwtPayload {
    sub: number;
    email: string;
    iat: number;
    exp: number;
}

@Injectable()
export class AuthService {
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly accessTokenDuration: number; // in seconds
    private readonly refreshTokenDuration: number; // in seconds
    private readonly bcryptSaltRounds: number;

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepositoryPort,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
        private readonly configService: ConfigService,
    ) {
        this.accessTokenSecret = this.configService.get<string>('JWT_ACCESS_SECRET', 'access-secret-dev');
        this.refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret-dev');
        this.accessTokenDuration = this.configService.get<number>('JWT_ACCESS_DURATION', 900); // 15 min
        this.refreshTokenDuration = this.configService.get<number>('JWT_REFRESH_DURATION', 604800); // 7 days
        this.bcryptSaltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    }

    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException('Un utilisateur avec cet email existe déjà');
        }

        const passwordHash = await this.hashPassword(dto.password);
        const user = await this.userRepository.create({
            email: dto.email,
            passwordHash,
            displayName: dto.displayName ?? null,
        });

        return this.generateAuthResponse(user);
    }

    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        const isPasswordValid = await this.verifyPassword(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        return this.generateAuthResponse(user);
    }

    async refresh(refreshToken: string): Promise<TokenRefreshResponseDto> {
        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

        if (!storedToken) {
            throw new UnauthorizedException('Refresh token invalide');
        }

        if (storedToken.revokedAt) {
            throw new UnauthorizedException('Refresh token révoqué');
        }

        if (storedToken.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expiré');
        }

        const user = await this.userRepository.findById(storedToken.userId);
        if (!user) {
            throw new UnauthorizedException('Utilisateur non trouvé');
        }

        // Revoke old token
        await this.refreshTokenRepository.revokeToken(storedToken.id);

        // Generate new tokens
        const accessToken = this.generateAccessToken(user);
        const newRefreshToken = await this.generateAndStoreRefreshToken(user.id);

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(refreshToken: string): Promise<void> {
        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

        if (storedToken) {
            await this.refreshTokenRepository.revokeToken(storedToken.id);
        }
    }

    async validateAccessToken(token: string): Promise<JwtPayload | null> {
        try {
            return this.verifyJwt(token, this.accessTokenSecret);
        } catch {
            return null;
        }
    }

    async getCurrentUser(userId: number): Promise<UserDto | null> {
        const user = await this.userRepository.findById(userId);
        if (!user) return null;

        return this.toUserDto(user);
    }

    // Password hashing using native crypto (PBKDF2-based, bcrypt-like security)
    private async hashPassword(password: string): Promise<string> {
        const salt = crypto.randomBytes(16).toString('hex');
        const iterations = Math.pow(2, this.bcryptSaltRounds);
        const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
        return `${salt}:${iterations}:${hash}`;
    }

    private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
        const [salt, iterationsStr, hash] = storedHash.split(':');
        const iterations = parseInt(iterationsStr, 10);
        const candidateHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(candidateHash));
    }

    // Simple JWT implementation
    private generateAccessToken(user: User): string {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.accessTokenDuration,
        };
        return this.signJwt(payload, this.accessTokenSecret);
    }

    private async generateAndStoreRefreshToken(userId: number): Promise<string> {
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date(Date.now() + this.refreshTokenDuration * 1000);

        await this.refreshTokenRepository.create({
            userId,
            tokenHash,
            expiresAt,
            revokedAt: null,
        });

        return token;
    }

    private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
        const accessToken = this.generateAccessToken(user);
        const refreshToken = await this.generateAndStoreRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
            user: this.toUserDto(user),
        };
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    private signJwt(payload: JwtPayload, secret: string): string {
        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
        const signature = crypto
            .createHmac('sha256', secret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    private verifyJwt(token: string, secret: string): JwtPayload {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }

        const [encodedHeader, encodedPayload, signature] = parts;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            throw new Error('Invalid signature');
        }

        const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JwtPayload;

        if (payload.exp < Math.floor(Date.now() / 1000)) {
            throw new Error('Token expired');
        }

        return payload;
    }

    private base64UrlEncode(str: string): string {
        return Buffer.from(str).toString('base64url');
    }

    private base64UrlDecode(str: string): string {
        return Buffer.from(str, 'base64url').toString('utf8');
    }

    private toUserDto(user: User): UserDto {
        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            createdAt: user.createdAt,
        };
    }
}
