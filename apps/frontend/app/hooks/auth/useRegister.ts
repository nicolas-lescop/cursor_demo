import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RegisterDto } from '@app/shared';
import { authApi } from '../../auth-api';
import { useAuthContext, authStorage } from './store';
import { authKeys } from './keys';

export const useRegister = () => {
    const queryClient = useQueryClient();
    const { setAuth } = useAuthContext();

    return useMutation({
        mutationFn: (data: RegisterDto) => authApi.register(data),
        onSuccess: (response) => {
            setAuth(response.user, response.accessToken, response.refreshToken);
            authStorage.setRefreshToken(response.refreshToken);
            queryClient.invalidateQueries({ queryKey: authKeys.me() });
        },
    });
};
