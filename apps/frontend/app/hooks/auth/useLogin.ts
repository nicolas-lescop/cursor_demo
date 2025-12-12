import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoginDto } from '@app/shared';
import { authApi } from '../../auth-api';
import { useAuthContext, authStorage } from './store';
import { authKeys } from './keys';

export const useLogin = () => {
    const queryClient = useQueryClient();
    const { setAuth } = useAuthContext();

    return useMutation({
        mutationFn: (data: LoginDto) => authApi.login(data),
        onSuccess: (response) => {
            setAuth(response.user, response.accessToken, response.refreshToken);
            authStorage.setRefreshToken(response.refreshToken);
            queryClient.invalidateQueries({ queryKey: authKeys.me() });
        },
    });
};
