import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../auth-api';
import { useAuthContext, authStorage } from './store';

export const useRefreshToken = () => {
    const { setTokens, clearAuth } = useAuthContext();

    return useMutation({
        mutationFn: (refreshToken: string) => authApi.refresh(refreshToken),
        onSuccess: (response) => {
            setTokens(response.accessToken, response.refreshToken);
            authStorage.setRefreshToken(response.refreshToken);
        },
        onError: () => {
            clearAuth();
            authStorage.clearRefreshToken();
        },
    });
};
