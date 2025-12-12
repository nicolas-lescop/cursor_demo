import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { RegisterForm } from './RegisterForm';
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
        register: vi.fn(),
        refresh: vi.fn(),
        me: vi.fn(),
    },
}));

const createTestRouter = () => {
    const rootRoute = createRootRoute({
        component: () => <RegisterForm />,
    });

    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: () => <div>Home</div>,
    });

    const loginRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/login',
        component: () => <div>Login</div>,
    });

    const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);
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

describe('RegisterForm', () => {
    it('renders the register form correctly', () => {
        renderWithProviders(<RegisterForm />);

        expect(screen.getByText('Créer un compte')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
        expect(screen.getByLabelText("Nom d'affichage")).toBeInTheDocument();
    });

    it('shows validation error for invalid email', async () => {
        renderWithProviders(<RegisterForm />);

        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: 'invalid' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/email invalide/i)).toBeInTheDocument();
        });
    });

    it('shows validation error for short password', async () => {
        renderWithProviders(<RegisterForm />);

        const passwordInput = screen.getByLabelText('Mot de passe');
        fireEvent.change(passwordInput, { target: { value: '123' } });
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument();
        });
    });

    it('has link to login page', () => {
        renderWithProviders(<RegisterForm />);

        expect(screen.getByText('Déjà un compte ?')).toBeInTheDocument();
        expect(screen.getByText('Se connecter')).toBeInTheDocument();
    });

    it('disables submit button when form is invalid', () => {
        renderWithProviders(<RegisterForm />);

        const submitButton = screen.getByRole('button', { name: "S'inscrire" });
        expect(submitButton).toBeDisabled();
    });
});
