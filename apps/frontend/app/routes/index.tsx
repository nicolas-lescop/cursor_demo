import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { CreatePromptModal } from '~/components/CreatePromptModal'
import { EditPromptModal } from '~/components/EditPromptModal'
import { DeletePromptDialog } from '~/components/DeletePromptDialog'
import { Search, Star } from 'lucide-react'
import { usePrompts, useSearchPrompts, useCreatePrompt, useUpdatePrompt, useDeletePrompt } from '~/hooks/prompts'
import Markdown from 'react-markdown'

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    const { t } = useTranslation()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeSearch, setActiveSearch] = useState('')
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

    // TanStack Query hooks
    const { data: prompts = [], isLoading: isLoadingPrompts } = usePrompts(showFavoritesOnly ? true : undefined)
    const { data: searchResults, isLoading: isSearching } = useSearchPrompts(activeSearch)
    const createPromptMutation = useCreatePrompt()
    const updatePromptMutation = useUpdatePrompt()
    const deletePromptMutation = useDeletePrompt()

    // Use search results if searching, otherwise use all prompts
    const displayedPrompts = activeSearch ? (searchResults ?? []) : prompts
    const isLoading = activeSearch ? isSearching : isLoadingPrompts

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        setActiveSearch(searchQuery.trim())
    }

    function handleClearSearch() {
        setSearchQuery('')
        setActiveSearch('')
    }

    async function handleCreatePrompt(data: { title: string; content: string }) {
        await createPromptMutation.mutateAsync({
            title: data.title,
            content: data.content,
            isFavorite: false,
        })
    }

    async function handleUpdatePrompt(id: number, data: { title: string; content: string }) {
        await updatePromptMutation.mutateAsync({ id, data })
    }

    async function handleToggleFavorite(id: number, currentValue: boolean) {
        await updatePromptMutation.mutateAsync({ id, data: { isFavorite: !currentValue } })
    }

    async function handleDeletePrompt(id: number) {
        await deletePromptMutation.mutateAsync(id)
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('home.title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('home.subtitle')}
                    </p>
                </div>
                <CreatePromptModal onSubmit={handleCreatePrompt} />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Favorites filter toggle */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={showFavoritesOnly ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className="gap-2"
                    >
                        <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                        {showFavoritesOnly ? t('home.favoritesOnly') : t('home.allPrompts')}
                    </Button>
                    {showFavoritesOnly && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFavoritesOnly(false)}
                            className="text-muted-foreground"
                        >
                            {t('common.reset')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-2 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('home.searchPlaceholder')}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        {t('common.search')}
                    </Button>
                    {activeSearch && (
                        <Button type="button" variant="ghost" onClick={handleClearSearch}>
                            {t('common.clear')}
                        </Button>
                    )}
                </div>
                {activeSearch && (
                    <p className="text-sm text-muted-foreground mt-2">
                        {t('home.searchResultsFor', { query: activeSearch })}
                    </p>
                )}
            </form>

            {/* Prompts grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : displayedPrompts.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground text-center mb-4">
                            {activeSearch
                                ? t('home.noPromptsFound', { query: activeSearch })
                                : t('home.noPromptsYet')}
                        </p>
                        {!activeSearch && <CreatePromptModal onSubmit={handleCreatePrompt} />}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {displayedPrompts.map((prompt) => (
                        <Card key={prompt.id} className="group hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg line-clamp-1">
                                        {prompt.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleToggleFavorite(prompt.id, prompt.isFavorite)}
                                            title={prompt.isFavorite ? t('prompt.removeFromFavorites') : t('prompt.addToFavorites')}
                                        >
                                            <Star className={`h-4 w-4 transition-colors ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`} />
                                        </Button>
                                        <EditPromptModal prompt={prompt} onSubmit={handleUpdatePrompt} />
                                        <DeletePromptDialog
                                            promptTitle={prompt.title}
                                            onConfirm={() => handleDeletePrompt(prompt.id)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto max-h-32">
                                    <Markdown>{prompt.content}</Markdown>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

