/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import { TanStackStartVitePlugin } from '@tanstack/react-start-plugin'
import path from 'path'

export default defineConfig({
    plugins: [
        !process.env.VITEST && TanStackStartVitePlugin({
            customViteReactPlugin: true,
            tsr: {
                routesDirectory: './app/routes',
                generatedRouteTree: './app/routeTree.gen.ts',
                srcDirectory: './app',
            },
        }),
        viteReact(),
    ],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './app'),
        },
    },
    server: {
        // Bind to all interfaces for Docker access
        host: '0.0.0.0',
        port: 3001,
        // Strict port - fail if port is in use
        strictPort: true,
        // Enable file watching with polling for Docker volumes
        watch: {
            usePolling: true,
            interval: 1000,
        },
        // HMR configuration for Docker - use the same port as the server
        hmr: {
            host: 'localhost',
            port: 3001,
            clientPort: 3001,
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './test/setup.ts',
    },
    ssr: {
        noExternal: ['@tanstack/start-server-core'],
    },
})
