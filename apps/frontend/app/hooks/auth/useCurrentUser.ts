import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../auth-api';
import { useAuthContext } from './store';
import { authKeys } from './keys';

export const useCurrentUser = () => {
    const { accessToken, isAuthenticated } = useAuthContext();

    return useQuery({
        queryKey: authKeys.me(),
        queryFn: () => authApi.me(accessToken!),
        enabled: isAuthenticated && !!accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
