import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'
import { UpdatePromptDto } from '@app/shared'
import { promptKeys } from './keys'

/**
 * Hook to update an existing prompt
 * Automatically invalidates the prompts cache on success
 */
export function useUpdatePrompt() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePromptDto }) =>
            api.updatePrompt(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: promptKeys.all })
        },
    })
}
