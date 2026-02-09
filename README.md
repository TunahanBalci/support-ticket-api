
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

- **Node.js** (v20+ recommended)
- **npm** (or pnpm/yarn)
- **PostgreSQL** (with `vector` extension enabled)
- **Redis Server** (required for background queues)

## Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/w3cj/support-ticket-api.git
    cd support-ticket-api
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. <br>Use the example below. Change the values with your own environment variable values:

    ```ini
    # App Settings
    NODE_ENV=development
    APP_HOST=0.0.0.0
    APP_PORT=8000

    # Database Configuration
    DATABASE_URL="postgres://user:password@localhost:5432/support_tickets?schema=public"

    # Authentication Settings
    AUTH_SECRET="your_super_secret_jwt_key" 
    AUTH_ACCESS_TOKEN_EXPIRES_IN="15m"              
    AUTH_REFRESH_TOKEN_EXPIRES_IN="24h"    

    # Pagination Settings
    PAGINATION_LIMIT_MESSAGE_BY_TICKET=50
    PAGINATION_LIMIT_MESSAGE_ALL=50
    PAGINATION_LIMIT_TICKET_BY_USER=50
    PAGINATION_LIMIT_TICKET_ALL=50

    # Slack Webhook
    SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

    # Redis Configuration
    REDIS_HOST="127.0.0.1"
    REDIS_PORT="6379"
    REDIS_PASSWORD=""
    ```

4.  **Database Setup**
    Ensure your PostgreSQL database is running and verify that the `vector` extension is installed.
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```
    
    Then run Prisma migrations to set up the schema:
    ```bash
    npx prisma migrate dev
    ```
    
    *Alternatively, if you want to push the schema without creating a migration file (e.g., for rapid prototyping):*
    ```bash
    npx prisma db push
    ```

5.  **Start Redis**
    Make sure your Redis server is running on the configured host and port.

## Running the Application

### Development Mode
Starts the API server and the Worker process in development mode (with hot reloading).
```bash
npm run dev

# run in a seperate terminal (as a seperate process):
npm run worker
```

### Production Mode
```bash
npm start
# And in a separate process/container:
npm run worker
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

## Integrations

### Slack Notifications
When a new ticket is created, a job is added to the `slack-notifications` queue. The worker processes this job and sends a formatted message to the configured `SLACK_WEBHOOK_URL`.

### IP Geolocation
When a user logs in or registers, their IP address is asynchronously processed to determine their country of origin. This data is added to their user profile for better support context. This process fails silently if the IP cannot be resolved, ensuring the user experience is not interrupted.

### Semantic Search
Messages and Tickets are automatically embedded using a local Transformer model when created. These embeddings are stored in Postgres (`pgvector`). The `/search` endpoint allows you to find relevant content based on meaning, not just keyword matching.
