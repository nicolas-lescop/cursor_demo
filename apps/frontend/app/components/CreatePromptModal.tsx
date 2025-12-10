import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Plus, Maximize2, Minimize2 } from 'lucide-react'
import { PromptFormSchema } from '@app/shared'
import { useModalExpandPreference } from '~/hooks/useModalExpandPreference'

interface CreatePromptModalProps {
    onSubmit: (data: { title: string; content: string }) => Promise<void>
}

export function CreatePromptModal({ onSubmit }: CreatePromptModalProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { isExpanded, toggleExpanded } = useModalExpandPreference()

    const form = useForm({
        defaultValues: {
            title: '',
            content: '',
            isFavorite: false,
        },
        validators: {
            onChange: ({ value }) => {
                const result = PromptFormSchema.safeParse(value)
                if (!result.success) {
                    return result.error.errors.map(e => e.message).join(', ')
                }
                return undefined
            },
        },
        onSubmit: async ({ value }) => {
            await onSubmit({ title: value.title!.trim(), content: value.content!.trim() })
            form.reset()
            setOpen(false)
        },
    })

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            form.reset()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('prompt.new')}
                </Button>
            </DialogTrigger>
            <DialogContent
                className={`${isExpanded ? 'sm:max-w-[95vw] h-[95vh]' : 'sm:max-w-[800px] max-h-[90vh]'} overflow-hidden flex flex-col transition-all duration-200`}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <DialogHeader>
                        <DialogTitle>{t('prompt.createTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('prompt.createDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-4 flex-1 overflow-hidden">
                        <form.Field name="title">
                            {(field) => (
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title">{t('prompt.nameLabel')}</Label>
                                    <Input
                                        id="title"
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder={t('prompt.namePlaceholder')}
                                        className="w-full"
                                    />
                                    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                                        <p className="text-sm text-destructive">
                                            {field.state.meta.errors.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="content">
                            {(field) => (
                                <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="content">{t('prompt.contentLabel')}</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={toggleExpanded}
                                            className="h-7 w-7"
                                            title={isExpanded ? t('common.reduce') : t('common.expand')}
                                        >
                                            {isExpanded ? (
                                                <Minimize2 className="h-4 w-4" />
                                            ) : (
                                                <Maximize2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="flex-1 overflow-hidden relative">
                                        <Textarea
                                            id="content"
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder={t('prompt.contentPlaceholder')}
                                            className="h-full min-h-[300px] resize-none font-mono text-sm"
                                            style={{ height: isExpanded ? 'calc(100vh - 320px)' : '300px' }}
                                        />
                                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                                            {(field.state.value ?? '').length} {t('common.characters')}
                                        </div>
                                    </div>
                                    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                                        <p className="text-sm text-destructive">
                                            {field.state.meta.errors.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={form.state.isSubmitting}
                        >
                            {t('common.cancel')}
                        </Button>
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                            {([canSubmit, isSubmitting]) => (
                                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                    {isSubmitting ? t('common.creating') : t('prompt.createButton')}
                                </Button>
                            )}
                        </form.Subscribe>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
