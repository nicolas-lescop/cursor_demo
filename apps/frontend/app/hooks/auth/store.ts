import { createContext, useContext } from 'react';
import { User } from '@app/shared';

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
};

export const AuthContext = createContext<AuthContextValue>({
    ...initialState,
    setAuth: () => {},
    setTokens: () => {},
    clearAuth: () => {},
    setLoading: () => {},
});

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

// Storage keys
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authStorage = {
    getRefreshToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },
    setRefreshToken: (token: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },
    clearRefreshToken: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};
