import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'
import { CreatePromptDto } from '@app/shared'
import { promptKeys } from './keys'

/**
 * Hook to create a new prompt
 * Automatically invalidates the prompts cache on success
 */
export function useCreatePrompt() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePromptDto) => api.createPrompt(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: promptKeys.all })
        },
    })
}
