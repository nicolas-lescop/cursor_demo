import { CreatePromptDto, PromptDto, UpdatePromptDto } from '@app/shared';

// Determine the API URL based on environment
// - Server-side (SSR in Docker): use the internal Docker network hostname
// - Client-side (browser): use localhost since ports are exposed
const getApiUrl = () => {
    // Check if we're running on the server (Node.js)
    if (typeof window === 'undefined') {
        // Server-side: use Docker internal network or environment variable
        return process.env.INTERNAL_API_URL || 'http://backend:3000';
    }
    // Client-side: use the exposed port via environment variable or default
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const API_URL = getApiUrl();

export const api = {
    getPrompts: async (isFavorite?: boolean): Promise<PromptDto[]> => {
        const url = new URL(`${API_URL}/prompts`);
        if (isFavorite) {
            url.searchParams.append('isFavorite', 'true');
        }
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch prompts');
        return res.json();
    },

    searchPrompts: async (query: string): Promise<PromptDto[]> => {
        const res = await fetch(`${API_URL}/prompts/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to search prompts');
        return res.json();
    },

    createPrompt: async (data: CreatePromptDto): Promise<PromptDto> => {
        const res = await fetch(`${API_URL}/prompts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create prompt');
        return res.json();
    },

    updatePrompt: async (id: number, data: UpdatePromptDto): Promise<PromptDto> => {
        const res = await fetch(`${API_URL}/prompts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update prompt');
        return res.json();
    },

    deletePrompt: async (id: number): Promise<void> => {
        const res = await fetch(`${API_URL}/prompts/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete prompt');
    },
};
