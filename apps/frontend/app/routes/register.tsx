import { createFileRoute } from '@tanstack/react-router';
import { RegisterForm } from '../components/RegisterForm';

export const Route = createFileRoute('/register')({
    component: RegisterPage,
});

function RegisterPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <RegisterForm />
        </div>
    );
}
