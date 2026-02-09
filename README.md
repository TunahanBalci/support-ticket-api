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

### Example API Calls

All examples assume the application is running in production mode via `docker compose up -d` on `localhost:8000`.

> **Notice**: Many endpoints require authentication. First, register or log in to obtain an access token, then pass it as a `Bearer` token in subsequent requests.

#### 1. Register a New User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com","password": "SecurePass123!"}'
```

#### 2. Log In

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com","password": "SecurePass123!"}'
```

> **Note**: Save the `accessToken` value. All the following requests use it as `$ACCESS_TOKEN`.

#### 3. Create a Ticket

```bash
curl -X POST http://localhost:8000/api/v1/ticket/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"title": "Cannot reset my password","description": "I clicked the reset link but the page returns a 404 error"}'
```

#### 4. Get a Ticket by ID

```bash
curl -X GET http://localhost:8000/api/v1/ticket/<TICKET_ID> \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
#### 5. List Tickets by User ID

```bash
curl -X GET "http://localhost:8000/api/v1/ticket/user/<USER_ID>?page=1&limit=10&orderBy=desc&orderType=createdAt" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
#### 6. List All Tickets (Support Agent Only)

```bash
curl -X GET "http://localhost:8000/api/v1/ticket/all/?page=1&limit=10&orderBy=desc&orderType=createdAt" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
#### 7. Update a Ticket

```bash
curl -X PUT http://localhost:8000/api/v1/ticket/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"id": "<TICKET_ID>","title": "Updated title","description": "Updated description","status": "IN_PROGRESS"}'
```

#### 8. Delete a Ticket (Soft Delete — Support Agent Only)

```bash
curl -X PUT http://localhost:8000/api/v1/ticket/delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{id": "<TICKET_ID>"}'
```

#### 9. Create a Message on a Ticket

```bash
curl -X POST http://localhost:8000/api/v1/message/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"content": "I have tried clearing my browser cache but the issue persists.", "ticketId": "<TICKET_ID>"}'
```

#### 10. List Messages by Ticket ID

```bash
curl -X GET "http://localhost:8000/api/v1/message/ticket/<TICKET_ID>?page=1&limit=10&orderBy=asc&orderType=createdAt" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### 11. List All Messages (Support Agent Only)

```bash
curl -X GET "http://localhost:8000/api/v1/message/all/?page=1&limit=10&orderBy=desc&orderType=createdAt" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### 12. Semantic Search

```bash
curl -X GET "http://localhost:8000/api/v1/search?query=password%20reset%20not%20working&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
