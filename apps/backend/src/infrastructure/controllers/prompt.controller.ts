import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PromptService } from '../../application/prompt.service';
import { CreatePromptDto, UpdatePromptDto, CreatePromptSchema, UpdatePromptSchema } from '@app/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('prompts')
export class PromptController {
    constructor(private readonly promptService: PromptService) { }

    @Get()
    async getAll(@Query('isFavorite') isFavorite?: string) {
        return this.promptService.getAllPrompts({
            isFavorite: isFavorite === 'true',
        });
    }

    @Get('search')
    async search(@Query('q') query: string) {
        return this.promptService.searchPrompts(query);
    }

    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return this.promptService.getPromptById(id);
    }

    @Post()
    async create(@Body(new ZodValidationPipe(CreatePromptSchema)) createPromptDto: CreatePromptDto) {
        return this.promptService.createPrompt(createPromptDto.title, createPromptDto.content, createPromptDto.isFavorite);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ZodValidationPipe(UpdatePromptSchema)) updatePromptDto: UpdatePromptDto,
    ) {
        return this.promptService.updatePrompt(id, updatePromptDto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.promptService.deletePrompt(id);
    }
}
