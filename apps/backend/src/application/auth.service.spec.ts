import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY } from '../domain/user/user.repository.port';
import { User, RefreshToken } from '../domain/user/user.entity';

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: jest.Mocked<{
        findById: jest.Mock;
        findByEmail: jest.Mock;
        create: jest.Mock;
    }>;
    let refreshTokenRepository: jest.Mocked<{
        create: jest.Mock;
        findByTokenHash: jest.Mock;
        revokeToken: jest.Mock;
        revokeAllUserTokens: jest.Mock;
    }>;

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        passwordHash: '',
        displayName: 'Test User',
        createdAt: new Date(),
    };

    beforeEach(async () => {
        userRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
        };

        refreshTokenRepository = {
            create: jest.fn(),
            findByTokenHash: jest.fn(),
            revokeToken: jest.fn(),
            revokeAllUserTokens: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: USER_REPOSITORY,
                    useValue: userRepository,
                },
                {
                    provide: REFRESH_TOKEN_REPOSITORY,
                    useValue: refreshTokenRepository,
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string, defaultValue: unknown) => defaultValue),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('register', () => {
        it('should create a new user and return auth response', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.create.mockImplementation(async (data) => ({
                ...mockUser,
                email: data.email,
                passwordHash: data.passwordHash,
            }));
            refreshTokenRepository.create.mockResolvedValue({
                id: 'token-id',
                userId: mockUser.id,
                tokenHash: 'hash',
                expiresAt: new Date(Date.now() + 604800000),
                revokedAt: null,
                createdAt: new Date(),
            });

            const result = await service.register({
                email: 'new@example.com',
                password: 'password123',
                displayName: 'New User',
            });

            expect(result.user.email).toBe('new@example.com');
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(userRepository.create).toHaveBeenCalled();
        });

        it('should throw ConflictException if email already exists', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);

            await expect(
                service.register({
                    email: 'test@example.com',
                    password: 'password123',
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('should return auth response for valid credentials', async () => {
            // Create a user with known password hash
            const password = 'password123';
            const hashedPassword = await (service as any).hashPassword(password);
            const userWithHash = { ...mockUser, passwordHash: hashedPassword };

            userRepository.findByEmail.mockResolvedValue(userWithHash);
            refreshTokenRepository.create.mockResolvedValue({
                id: 'token-id',
                userId: mockUser.id,
                tokenHash: 'hash',
                expiresAt: new Date(Date.now() + 604800000),
                revokedAt: null,
                createdAt: new Date(),
            });

            const result = await service.login({
                email: 'test@example.com',
                password,
            });

            expect(result.user.email).toBe('test@example.com');
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
        });

        it('should throw UnauthorizedException for non-existent user', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await expect(
                service.login({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for wrong password', async () => {
            const hashedPassword = await (service as any).hashPassword('correctpassword');
            userRepository.findByEmail.mockResolvedValue({
                ...mockUser,
                passwordHash: hashedPassword,
            });

            await expect(
                service.login({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('refresh', () => {
        it('should return new tokens for valid refresh token', async () => {
            const refreshToken = 'valid-refresh-token';
            const storedToken: RefreshToken = {
                id: 'token-id',
                userId: mockUser.id,
                tokenHash: (service as any).hashToken(refreshToken),
                expiresAt: new Date(Date.now() + 604800000),
                revokedAt: null,
                createdAt: new Date(),
            };

            refreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken);
            userRepository.findById.mockResolvedValue(mockUser);
            refreshTokenRepository.revokeToken.mockResolvedValue(undefined);
            refreshTokenRepository.create.mockResolvedValue({
                ...storedToken,
                id: 'new-token-id',
            });

            const result = await service.refresh(refreshToken);

            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(refreshTokenRepository.revokeToken).toHaveBeenCalledWith('token-id');
        });

        it('should throw UnauthorizedException for invalid refresh token', async () => {
            refreshTokenRepository.findByTokenHash.mockResolvedValue(null);

            await expect(service.refresh('invalid-token')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException for revoked refresh token', async () => {
            const storedToken: RefreshToken = {
                id: 'token-id',
                userId: mockUser.id,
                tokenHash: 'hash',
                expiresAt: new Date(Date.now() + 604800000),
                revokedAt: new Date(), // Token is revoked
                createdAt: new Date(),
            };

            refreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken);

            await expect(service.refresh('revoked-token')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException for expired refresh token', async () => {
            const storedToken: RefreshToken = {
                id: 'token-id',
                userId: mockUser.id,
                tokenHash: 'hash',
                expiresAt: new Date(Date.now() - 1000), // Token is expired
                revokedAt: null,
                createdAt: new Date(),
            };

            refreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken);

            await expect(service.refresh('expired-token')).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('logout', () => {
        it('should revoke the refresh token', async () => {
            const refreshToken = 'valid-refresh-token';
            const storedToken: RefreshToken = {
                id: 'token-id',
                userId: mockUser.id,
                tokenHash: (service as any).hashToken(refreshToken),
                expiresAt: new Date(Date.now() + 604800000),
                revokedAt: null,
                createdAt: new Date(),
            };

            refreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken);
            refreshTokenRepository.revokeToken.mockResolvedValue(undefined);

            await service.logout(refreshToken);

            expect(refreshTokenRepository.revokeToken).toHaveBeenCalledWith('token-id');
        });

        it('should not throw if token does not exist', async () => {
            refreshTokenRepository.findByTokenHash.mockResolvedValue(null);

            await expect(service.logout('nonexistent-token')).resolves.not.toThrow();
        });
    });

    describe('validateAccessToken', () => {
        it('should return payload for valid access token', async () => {
            const hashedPassword = await (service as any).hashPassword('password123');
            const user = { ...mockUser, passwordHash: hashedPassword };

            userRepository.findByEmail.mockResolvedValue(user);
            refreshTokenRepository.create.mockResolvedValue({
                id: 'token-id',
                userId: mockUser.id,
                tokenHash: 'hash',
                expiresAt: new Date(Date.now() + 604800000),
                revokedAt: null,
                createdAt: new Date(),
            });

            const authResponse = await service.login({
                email: 'test@example.com',
                password: 'password123',
            });

            const payload = await service.validateAccessToken(authResponse.accessToken);

            expect(payload).not.toBeNull();
            expect(payload?.sub).toBe(mockUser.id);
            expect(payload?.email).toBe(mockUser.email);
        });

        it('should return null for invalid access token', async () => {
            const payload = await service.validateAccessToken('invalid-token');
            expect(payload).toBeNull();
        });
    });
});
