import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../auth-api';
import { useAuthContext, authStorage } from './store';
import { authKeys } from './keys';

export const useLogout = () => {
    const queryClient = useQueryClient();
    const { refreshToken, clearAuth } = useAuthContext();

    return useMutation({
        mutationFn: async () => {
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
        },
        onSettled: () => {
            clearAuth();
            authStorage.clearRefreshToken();
            queryClient.removeQueries({ queryKey: authKeys.all });
        },
    });
};
