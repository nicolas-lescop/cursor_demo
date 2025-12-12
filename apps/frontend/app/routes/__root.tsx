import { Outlet, createRootRoute, HeadContent, Scripts, Link } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import '../globals.css'
import '../i18n'
import { AuthProvider } from '../components/AuthProvider'
import { UserMenu } from '../components/UserMenu'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            refetchOnWindowFocus: false,
        },
    },
})

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RootDocument>
                    <Outlet />
                </RootDocument>
            </AuthProvider>
        </QueryClientProvider>
    )
}

function RootDocument({ children }: { children: ReactNode }) {
    return (
        <html suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body suppressHydrationWarning>
                <div className="p-4 flex items-center justify-between border-b">
                    <Link to="/" className="text-lg font-bold hover:opacity-80">
                        Prompt Manager
                    </Link>
                    <UserMenu />
                </div>
                <div className="p-4">{children}</div>
                <Scripts />
            </body>
        </html>
    )
}
