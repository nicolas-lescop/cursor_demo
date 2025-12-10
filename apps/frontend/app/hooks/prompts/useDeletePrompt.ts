import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'
import { promptKeys } from './keys'

/**
 * Hook to delete a prompt
 * Automatically invalidates the prompts cache on success
 */
export function useDeletePrompt() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => api.deletePrompt(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: promptKeys.all })
        },
    })
}
