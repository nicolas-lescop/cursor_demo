import { Prompt } from './prompt.entity';

export interface PromptRepositoryPort {
    findAll(filters?: { isFavorite?: boolean }): Promise<Prompt[]>;
    findById(id: number): Promise<Prompt | null>;
    create(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt>;
    update(id: number, prompt: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Prompt>;
    delete(id: number): Promise<void>;
    search(query: string): Promise<Prompt[]>;
}

export const PROMPT_REPOSITORY = 'PROMPT_REPOSITORY';
