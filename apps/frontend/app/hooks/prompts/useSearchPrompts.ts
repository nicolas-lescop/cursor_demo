import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'
import { promptKeys } from './keys'

/**
 * Hook to search prompts by query string
 * @param query - Search query string
 */
export function useSearchPrompts(query: string) {
    return useQuery({
        queryKey: promptKeys.search(query),
        queryFn: () => api.searchPrompts(query),
        enabled: query.trim().length > 0,
    })
}
