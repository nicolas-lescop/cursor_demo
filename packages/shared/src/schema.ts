import { z } from 'zod';

export const PromptSchema = z.object({
    id: z.number(),
    title: z.string().min(1),
    content: z.string().min(1),
    isFavorite: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const CreatePromptSchema = PromptSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdatePromptSchema = CreatePromptSchema.partial();

// Form validation schemas with custom error messages
export const PromptFormSchema = z.object({
    title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    content: z.string().min(1, 'Le contenu est requis'),
    isFavorite: z.boolean().optional(),
});
// Explicitly define types to avoid Zod's complex generic type inference issues
export interface PromptDto {
    id: number;
    title: string;
    content: string;
    isFavorite: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePromptDto {
    title: string;
    content: string;
    isFavorite?: boolean;
}

export interface UpdatePromptDto {
    title?: string;
    content?: string;
    isFavorite?: boolean;
}

export interface PromptFormData {
    title: string;
    content: string;
    isFavorite: boolean;
}
