import { z } from 'zod';

// Registration
export const RegisterSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    displayName: z.string().min(1, 'Le nom est requis').optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

// Login
export const LoginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// Refresh token
export const RefreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token requis'),
});

export type RefreshDto = z.infer<typeof RefreshSchema>;

// Logout
export const LogoutSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token requis'),
});

export type LogoutDto = z.infer<typeof LogoutSchema>;

// User response (without sensitive data)
export const UserSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    displayName: z.string().nullable(),
    createdAt: z.date(),
});

export type UserDto = z.infer<typeof UserSchema>;

// Auth response (tokens)
export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: UserSchema,
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;

// Token refresh response
export const TokenRefreshResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export type TokenRefreshResponseDto = z.infer<typeof TokenRefreshResponseSchema>;

// User interfaces for frontend/backend
export interface User {
    id: number;
    email: string;
    displayName: string | null;
    createdAt: Date;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
