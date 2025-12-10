/**
 * Query keys for prompts cache management
 */
export const promptKeys = {
    all: ['prompts'] as const,
    filtered: (isFavorite?: boolean) => ['prompts', { isFavorite }] as const,
    search: (query: string) => ['prompts', 'search', query] as const,
}
