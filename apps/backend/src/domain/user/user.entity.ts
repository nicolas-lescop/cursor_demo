export interface User {
    id: number;
    email: string;
    passwordHash: string;
    displayName: string | null;
    createdAt: Date;
}

export interface RefreshToken {
    id: string;
    userId: number;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
}
