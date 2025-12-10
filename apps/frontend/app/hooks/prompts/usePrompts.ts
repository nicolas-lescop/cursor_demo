import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'
import { promptKeys } from './keys'

/**
 * Hook to fetch all prompts
 * @param isFavorite - Optional filter for favorite prompts only
 */
export function usePrompts(isFavorite?: boolean) {
    return useQuery({
        queryKey: isFavorite !== undefined ? promptKeys.filtered(isFavorite) : promptKeys.all,
        queryFn: () => api.getPrompts(isFavorite),
    })
}
