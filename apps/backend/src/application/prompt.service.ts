import { Inject, Injectable } from '@nestjs/common';
import { PROMPT_REPOSITORY, PromptRepositoryPort } from '../domain/prompt/prompt.repository.port';
import { Prompt } from '../domain/prompt/prompt.entity';

@Injectable()
export class PromptService {
    constructor(@Inject(PROMPT_REPOSITORY) private promptRepository: PromptRepositoryPort) { }

    async getAllPrompts(options?: { isFavorite?: boolean }): Promise<Prompt[]> {
        return this.promptRepository.findAll(options);
    }

    async getPromptById(id: number): Promise<Prompt | null> {
        return this.promptRepository.findById(id);
    }

    async createPrompt(title: string, content: string, isFavorite: boolean = false): Promise<Prompt> {
        return this.promptRepository.create({ title, content, isFavorite });
    }

    async updatePrompt(id: number, data: { title?: string; content?: string; isFavorite?: boolean }): Promise<Prompt> {
        return this.promptRepository.update(id, data);
    }

    async deletePrompt(id: number): Promise<void> {
        return this.promptRepository.delete(id);
    }

    async searchPrompts(query: string): Promise<Prompt[]> {
        return this.promptRepository.search(query);
    }
}
