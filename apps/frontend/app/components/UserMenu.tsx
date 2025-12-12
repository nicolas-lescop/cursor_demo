import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { useAuthContext, useLogout } from '~/hooks/auth';
import { Link } from '@tanstack/react-router';
import { LogOut, User } from 'lucide-react';

export function UserMenu() {
    const { t } = useTranslation();
    const { user, isAuthenticated, isLoading } = useAuthContext();
    const logout = useLogout();

    if (isLoading) {
        return (
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">{t('auth.login')}</Link>
                </Button>
                <Button size="sm" asChild>
                    <Link to="/register">{t('auth.register')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user.displayName || user.email}</span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="gap-2"
            >
                <LogOut className="h-4 w-4" />
                {t('auth.logout')}
            </Button>
        </div>
    );
}
