import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import '../globals.css'
import '../i18n'

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
            <RootDocument>
                <Outlet />
            </RootDocument>
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
                <div className="p-2 flex gap-2 text-lg">
                    <h1 className="font-bold">Prompt Manager</h1>
                </div>
                <hr />
                <div className="p-2">{children}</div>
                <Scripts />
            </body>
        </html>
    )
}
