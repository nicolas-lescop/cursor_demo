import { useState, useCallback, useEffect, ReactNode } from 'react';
import { User } from '@app/shared';
import { AuthContext, AuthState, authStorage } from '../hooks/auth/store';
import { authApi } from '../auth-api';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const setAuth = useCallback((user: User, accessToken: string, refreshToken: string) => {
        setState({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
        });
    }, []);

    const setTokens = useCallback((accessToken: string, refreshToken: string) => {
        setState((prev) => ({
            ...prev,
            accessToken,
            refreshToken,
        }));
    }, []);

    const clearAuth = useCallback(() => {
        setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setState((prev) => ({
            ...prev,
            isLoading: loading,
        }));
    }, []);

    // Try to restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            const storedRefreshToken = authStorage.getRefreshToken();
            if (!storedRefreshToken) {
                setLoading(false);
                return;
            }

            try {
                const tokens = await authApi.refresh(storedRefreshToken);
                authStorage.setRefreshToken(tokens.refreshToken);

                const user = await authApi.me(tokens.accessToken);
                setAuth(user, tokens.accessToken, tokens.refreshToken);
            } catch {
                authStorage.clearRefreshToken();
                setLoading(false);
            }
        };

        restoreSession();
    }, [setAuth, setLoading]);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                setAuth,
                setTokens,
                clearAuth,
                setLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
