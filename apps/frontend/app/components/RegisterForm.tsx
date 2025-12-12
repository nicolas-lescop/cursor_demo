import { RegisterSchema } from '@app/shared';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { useRegister } from '~/hooks/auth';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export function RegisterForm() {
    const { t } = useTranslation();
    const register = useRegister();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
            displayName: '',
        },
        validators: {
            onChange: ({ value }) => {
                const result = RegisterSchema.safeParse(value);
                if (!result.success) {
                    return result.error.errors.map((e) => e.message).join(', ');
                }
                return undefined;
            },
        },
        onSubmit: async ({ value }) => {
            setError(null);
            try {
                await register.mutateAsync({
                    email: value.email,
                    password: value.password,
                    displayName: value.displayName || undefined,
                });
                navigate({ to: '/' });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur d'inscription");
            }
        },
    });

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>{t('auth.registerTitle')}</CardTitle>
                <CardDescription>{t('auth.registerDescription')}</CardDescription>
            </CardHeader>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
            >
                <CardContent className="flex flex-col gap-4">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                            {error}
                        </div>
                    )}

                    <form.Field name="email">
                        {(field) => (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder={t('auth.emailPlaceholder')}
                                    autoComplete="email"
                                />
                                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                                    <p className="text-sm text-destructive">
                                        {field.state.meta.errors.join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="password">
                        {(field) => (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password">{t('auth.password')}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder={t('auth.passwordPlaceholder')}
                                    autoComplete="new-password"
                                />
                                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                                    <p className="text-sm text-destructive">
                                        {field.state.meta.errors.join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="displayName">
                        {(field) => (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="displayName">{t('auth.displayName')}</Label>
                                <Input
                                    id="displayName"
                                    type="text"
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder={t('auth.displayNamePlaceholder')}
                                    autoComplete="name"
                                />
                            </div>
                        )}
                    </form.Field>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                                {isSubmitting ? t('auth.registering') : t('auth.registerButton')}
                            </Button>
                        )}
                    </form.Subscribe>

                    <p className="text-sm text-muted-foreground text-center">
                        {t('auth.haveAccount')}{' '}
                        <Link to="/login" className="text-primary hover:underline">
                            {t('auth.signIn')}
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
