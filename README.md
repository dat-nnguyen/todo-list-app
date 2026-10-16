# Todo List App

A full-stack todo list application with authentication, session-based auth, and cursor pagination.

## Tech Stack

### Frontend
- React (JavaScript)
- Vite
- TanStack Query (React Query)

### Backend
- Node.js
- Express
- PostgreSQL (via `pg`)
- `node-pg-migrate` for database migrations
- Zod for request validation
- `express-session` with `connect-pg-simple` for session management
- bcrypt for password hashing
- helmet, cors, express-rate-limit

### Development & Testing
- Jest + Supertest
- nodemon
- Docker (for PostgreSQL during development)

## Project Structure

```
todo-app/
├── front-end/                 # React + Vite frontend
│   └── src/
│       ├── api/              # API client functions
│       ├── components/       # Reusable UI components
│       ├── features/         # Domain-specific modules
│       │   ├── auth/
│       │   └── todos/
│       ├── hooks/            # Custom React hooks
│       ├── pages/            # Page components
│       └── utils/            # Utility functions
│
├── backend/                   # Express backend
│   ├── src/
│   │   ├── app.js            # Express app setup and middleware
│   │   ├── server.js         # Server entry point
│   │   ├── config/           # Environment configuration
│   │   ├── db/               # Database connection helpers
│   │   ├── middleware/       # Express middleware (auth, validation, error handling)
│   │   └── modules/          # Feature modules
│   │       ├── auth/
│   │       └── todos/
│   ├── migrations/           # Database migration files
│   └── tests/                # Unit and integration tests
│       ├── integration/
│       └── unit/
│
├── compose.yaml              # Docker Compose configuration
└── README.md                 # Project documentation
```

