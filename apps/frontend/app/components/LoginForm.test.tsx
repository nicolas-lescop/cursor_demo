import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { LoginForm } from './LoginForm';
import { AuthProvider } from './AuthProvider';
import { vi } from 'vitest';

// Mock icons
vi.mock('lucide-react', () => ({
    Plus: () => <div data-testid="plus-icon" />,
    Maximize2: () => <div data-testid="maximize-icon" />,
    Minimize2: () => <div data-testid="minimize-icon" />,
    X: () => <div data-testid="x-icon" />,
    LogOut: () => <div data-testid="logout-icon" />,
    User: () => <div data-testid="user-icon" />,
}));

// Mock auth API
vi.mock('../auth-api', () => ({
    authApi: {
        login: vi.fn(),
        refresh: vi.fn(),
        me: vi.fn(),
    },
}));

const createTestRouter = () => {
    const rootRoute = createRootRoute({
        component: () => <LoginForm />,
    });

    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: () => <div>Home</div>,
    });

    const registerRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/register',
        component: () => <div>Register</div>,
    });

    const routeTree = rootRoute.addChildren([indexRoute, registerRoute]);
    return createRouter({ routeTree });
};

const renderWithProviders = (component: React.ReactNode) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    const router = createTestRouter();

    return render(
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>,
    );
};

describe('LoginForm', () => {
    it('renders the login form correctly', () => {
        renderWithProviders(<LoginForm />);

        expect(screen.getByText('Se connecter')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    });

    it('shows validation error for invalid email', async () => {
        renderWithProviders(<LoginForm />);

        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: 'invalid' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/email invalide/i)).toBeInTheDocument();
        });
    });

    it('shows validation error for empty password', async () => {
        renderWithProviders(<LoginForm />);

        const passwordInput = screen.getByLabelText('Mot de passe');
        fireEvent.change(passwordInput, { target: { value: '' } });
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/mot de passe est requis/i)).toBeInTheDocument();
        });
    });

    it('has link to register page', () => {
        renderWithProviders(<LoginForm />);

        expect(screen.getByText('Pas de compte ?')).toBeInTheDocument();
        expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    });

    it('disables submit button when form is invalid', () => {
        renderWithProviders(<LoginForm />);

        const submitButton = screen.getByRole('button', { name: 'Se connecter' });
        expect(submitButton).toBeDisabled();
    });
});
