import { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuthContext } from '~/hooks/auth';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { t } = useTranslation();
    const { isAuthenticated, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-muted-foreground">{t('common.loading')}</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}
