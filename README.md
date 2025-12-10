# Prompt Manager

A full-stack application for managing prompts, built with a modern Monorepo architecture.

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **Backend**: NestJS, Hexagonal Architecture, Drizzle ORM, PostgreSQL
- **Frontend**: React, Vite, TanStack Start (SSR), TailwindCSS
- **Shared**: Zod schemas for end-to-end type safety

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

## Getting Started

### Option 1: Docker Development Mode (Recommended) 🔥

Run the entire stack in Docker with **hot reload enabled** - any changes you make to your local code will automatically refresh in the containers.

```bash
# Start all services with hot reload
pnpm docker:dev

# Or run in detached mode (background)
pnpm docker:dev:detach

# View logs when running in detached mode
pnpm docker:dev:logs

# Stop all services
pnpm docker:dev:down
```

Access the applications:
- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **PostgreSQL**: `localhost:5432` (user: `user`, password: `password`, db: `prompts_db`)

**Hot Reload Details:**
- **Backend (NestJS)**: Uses `nest start --watch` for automatic TypeScript recompilation
- **Frontend (Vite)**: Uses Vite's HMR (Hot Module Replacement) for instant updates
- Source code is mounted as Docker volumes, so changes are immediately reflected

### Option 2: Docker Production Mode

Build and run optimized production images:

```bash
pnpm docker:prod
```

### Option 3: Local Development (without Docker for apps)

If you prefer to run the apps locally:

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Start the Database** (still uses Docker):
    ```bash
    docker-compose up postgres -d
    ```

3.  **Push Database Schema**:
    ```bash
    cd apps/backend
    npx drizzle-kit push:pg
    ```

4.  **Start Development Servers**:
    From the root directory:
    ```bash
    pnpm dev
    ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all apps locally with hot reload |
| `pnpm build` | Build all apps for production |
| `pnpm docker:dev` | Start Docker dev environment with hot reload |
| `pnpm docker:dev:detach` | Start Docker dev environment in background |
| `pnpm docker:dev:down` | Stop Docker dev environment |
| `pnpm docker:dev:logs` | View Docker dev environment logs |
| `pnpm docker:prod` | Build and run production Docker images |

## Project Structure

```
├── apps/
│   ├── backend/          # NestJS application (API)
│   │   ├── src/
│   │   ├── Dockerfile    # Production Dockerfile
│   │   └── Dockerfile.dev # Development Dockerfile with hot reload
│   └── frontend/         # React application with TanStack Start
│       ├── app/
│       ├── Dockerfile    # Production Dockerfile
│       └── Dockerfile.dev # Development Dockerfile with HMR
├── packages/
│   └── shared/           # Shared Zod schemas and TypeScript types
├── docker-compose.yml    # Production Docker Compose
└── docker-compose.dev.yml # Development Docker Compose with hot reload
```

## Troubleshooting Docker Development

### Hot Reload Not Working

1. **Check container logs**: `pnpm docker:dev:logs`
2. **Restart containers**: Sometimes a fresh restart helps
   ```bash
   pnpm docker:dev:down
   pnpm docker:dev
   ```
3. **Clear Docker volumes** (if dependencies seem out of sync):
   ```bash
   docker-compose -f docker-compose.dev.yml down -v
   pnpm docker:dev
   ```

### Port Conflicts

If ports 3000, 3001, or 5432 are already in use, stop the conflicting services or modify the ports in `docker-compose.dev.yml`.
