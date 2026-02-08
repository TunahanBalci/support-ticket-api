# Support Ticket API

A backend service for a support ticket system, built with Node.js, Express, Prisma, and PostgreSQL. This API allows users to register, login, create/manage support tickets, and post messages.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Authentication**: JWT (JSON Web Tokens)
-   **Validation**: Zod
-   **Testing**: Vitest, Supertest
-   **Documentation**: Swagger UI

## Prerequisites

-   Node.js (v18+)
-   PostgreSQL installed and running

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd support-ticket-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (copy from `.env.example` if available) and add the following:

    ```env
    # Database Connection
    DATABASE_URL="postgresql://user:password@localhost:5432/support_ticket_db?schema=public"

    # Server Configuration
    PORT=3000
    NODE_ENV=development

    # Authentication
    AUTH_SECRET="your-super-secret-key-change-it"
    AUTH_EXPIRES_IN="15m"
    REFRESH_SECRET="your-super-secret-refresh-key-change-it"
    REFRESH_EXPIRES_IN="7d"
    ```

4.  **Database Migration:**
    Run the migrations to set up your database schema:
    ```bash
    npx prisma migrate dev --name init
    ```

## Running the Server

-   **Development Mode:**
    ```bash
    npm run dev
    ```
    The server will start at `http://localhost:3000`.

-   **Production Build:**
    ```bash
    npm run build
    npm start
    ```

## Running Tests

Run the full test suite including unit and integration tests:
```bash
npm test
```

## API Documentation

The API is documented using Swagger. Once the server is running, visit:

**[http://localhost:3000/api/api-docs](http://localhost:3000/api/api-docs)**

## Example Usage

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### 3. Create a Ticket (Requires Token)
```bash
curl -X POST http://localhost:3000/api/ticket/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "title": "Login Issue",
    "description": "I cannot login to my account."
  }'
```

## Project Structure

-   `src/api`: API entry point
-   `src/config`: Configuration files (Swagger)
-   `src/controllers`: Request handlers
-   `src/data`: Prisma schema
-   `src/middlewares`: Auth, Validation, Error handling
-   `src/routes`: Route definitions
-   `src/utils`: Helper functions (Permissions, JWT, etc.)
-   `test`: Unit and Integration tests
