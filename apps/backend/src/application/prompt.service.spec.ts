import { Test, TestingModule } from '@nestjs/testing';
import { PromptService } from './prompt.service';
import { PROMPT_REPOSITORY, PromptRepositoryPort } from '../domain/prompt/prompt.repository.port';
import { Prompt } from '../domain/prompt/prompt.entity';

const mockPromptRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
};

describe('PromptService', () => {
    let service: PromptService;
    let repository: PromptRepositoryPort;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PromptService,
                {
                    provide: PROMPT_REPOSITORY,
                    useValue: mockPromptRepository,
                },
            ],
        }).compile();

        service = module.get<PromptService>(PromptService);
        repository = module.get<PromptRepositoryPort>(PROMPT_REPOSITORY);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllPrompts', () => {
        it('should return an array of prompts', async () => {
            const expectedPrompts: Prompt[] = [
                new Prompt(1, 'Test', 'Content', false, new Date(), new Date()),
            ];
            mockPromptRepository.findAll.mockResolvedValue(expectedPrompts);

            const result = await service.getAllPrompts();
            expect(result).toEqual(expectedPrompts);
            expect(repository.findAll).toHaveBeenCalled();
        });
    });

    describe('createPrompt', () => {
        it('should create and return a prompt', async () => {
            const newPrompt = new Prompt(1, 'New', 'Content', false, new Date(), new Date());
            mockPromptRepository.create.mockResolvedValue(newPrompt);

            const result = await service.createPrompt('New', 'Content');
            expect(result).toEqual(newPrompt);
            expect(repository.create).toHaveBeenCalledWith({
                title: 'New',
                content: 'Content',
                isFavorite: false,
            });
        });
    });

    describe('searchPrompts', () => {
        it('should return filtered prompts', async () => {
            const expectedPrompts: Prompt[] = [
                new Prompt(1, 'Search Match', 'Content', false, new Date(), new Date()),
            ];
            mockPromptRepository.search.mockResolvedValue(expectedPrompts);

            const result = await service.searchPrompts('Search');
            expect(result).toEqual(expectedPrompts);
            expect(repository.search).toHaveBeenCalledWith('Search');
        });
    });
});
