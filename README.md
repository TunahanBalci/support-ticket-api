
# Support Ticket API

A robust, scalable REST API for managing support tickets, featuring asynchronous processing, real-time Slack notifications, and semantic search capabilities using local LLM embeddings.

## Features

- **Ticket Management**: Create, read, update, and resolve support tickets.
- **Message System**: Threaded messages within tickets.
- **Asynchronous Processing**: Heavy tasks (notifications, embeddings, geo-enrichment) are offloaded to **BullMQ** queues backed by **Redis**.
- **Semantic Search**: Search tickets and messages using natural language queries, powered by local embeddings (**@xenova/transformers**) and **pgvector**.
- **Geolocation Enrichment**: Automatically enriches user profiles with country data based on IP address.
- **Slack Integration**: Real-time notifications to a Slack channel when new tickets are created.
- **Authentication**: Secure JWT-based authentication with refresh tokens.

## Tech Stack

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Database**: PostgreSQL (with `pgvector` extension)
- **ORM**: Prisma
- **Queue System**: BullMQ + Redis
- **Embeddings**: Local inference with `@xenova/transformers` (all-MiniLM-L6-v2)
- **Validation**: Zod
- **Testing**: Vitest (Unit, Integration, E2E)
- **Documentation**: Swagger UI

## Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)

## Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/w3cj/support-ticket-api.git
cd support-ticket-api
```

### 2. Environment Configuration
Create a `.env` file in the root directory with your configuration:

```ini
# App Settings
APP_HOST=0.0.0.0
APP_PORT=8000

# Database Configuration (PostgreSQL)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=support_tickets
DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public&sslmode=disable"

# Authentication Settings
AUTH_SECRET="your_super_secret_jwt_key"
AUTH_ACCESS_TOKEN_EXPIRES_IN="15m"
AUTH_REFRESH_TOKEN_EXPIRES_IN="24h"

# Pagination Settings
PAGINATION_LIMIT_MESSAGE_BY_TICKET=50
PAGINATION_LIMIT_MESSAGE_ALL=50
PAGINATION_LIMIT_TICKET_BY_USER=50
PAGINATION_LIMIT_TICKET_ALL=50

# Slack Webhook (optional - for ticket notifications)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=""
```

> **Important**: Change the `AUTH_SECRET` to a strong, random value for production use.

### 3. Start the Application
Launch all services (API, Worker, Database, Redis) with a single command:

```bash
docker compose up --build
```

## Running the Application

### Production Mode (Docker)
```bash
# Start all services:
docker compose up -d

# Stopp all services:
docker compose down

# View logs
docker compose logs -f api worker

# Rebuild after code changes:
docker compose up --build -d
```

### Development Mode (Local)
For local development without Docker:

**Prerequisites:**
- Node.js v20+
- PostgreSQL with pgvector extension
- Redis server

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start API (process 1)
npm run dev

# Start Worker (process 2)
npm run worker
```

## Container Management

### Accessing Container Shells
```bash
# API container
docker compose exec api sh

# Worker container
docker compose exec worker sh

# Database container
docker compose exec <db_name> psql -U <db_user_name> -d <table_name>
```

### Viewing Service Logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs api
docker compose logs worker

# Follow logs in real-time
docker compose logs -f
```

## Testing

The project includes a comprehensive test suite using **Vitest**.

- **Unit Tests**: `npm test`
- **Integration Tests**: `npm run test:integration`
- **End-to-End (E2E) System Tests**: `npm run test:e2e`

> **Note**: E2E tests require a running database and Redis instance.

## API Documentation

Detailed endpoint documentation is available via **Swagger UI**.

Start the application and visit:
**[http://localhost:8000/api/v1/api-docs](http://localhost:8000/api/v1/api-docs)**

### Key Endpoints Overview

-   **Auth**: `/api/v1/auth/register`, `/api/v1/auth/login`
-   **Tickets**: `/api/v1/ticket/create`, `/api/v1/ticket/{id}`, `/api/v1/ticket/user/{userId}`
-   **Messages**: `/api/v1/message/create`, `/api/v1/message/ticket/{ticketId}`
-   **Search**: `/api/v1/search?query=...` (Semantic Search)

