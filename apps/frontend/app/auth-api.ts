import {
    RegisterDto,
    LoginDto,
    AuthResponseDto,
    TokenRefreshResponseDto,
    UserDto,
} from '@app/shared';

// Determine the API URL based on environment
const getApiUrl = () => {
    if (typeof window === 'undefined') {
        return process.env.INTERNAL_API_URL || 'http://backend:3000';
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const API_URL = getApiUrl();

export class AuthApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
    ) {
        super(message);
        this.name = 'AuthApiError';
    }
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new AuthApiError(errorData.message || 'Erreur de requête', res.status);
    }
    return res.json();
}

export const authApi = {
    register: async (data: RegisterDto): Promise<AuthResponseDto> => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse<AuthResponseDto>(res);
    },

    login: async (data: LoginDto): Promise<AuthResponseDto> => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse<AuthResponseDto>(res);
    },

    refresh: async (refreshToken: string): Promise<TokenRefreshResponseDto> => {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        return handleResponse<TokenRefreshResponseDto>(res);
    },

    logout: async (refreshToken: string): Promise<void> => {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
    },

    me: async (accessToken: string): Promise<UserDto> => {
        const res = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return handleResponse<UserDto>(res);
    },
};
