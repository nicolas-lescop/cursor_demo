import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '../components/LoginForm';

export const Route = createFileRoute('/login')({
    component: LoginPage,
});

function LoginPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <LoginForm />
        </div>
    );
}
