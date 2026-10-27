# Todo List App

A full-stack task manager built with React and Express. It supports session-based authentication, date-based task lists, cursor pagination, and Memcached caching. Docker Compose runs the frontend, Nginx reverse proxy, API, PostgreSQL, and Memcached locally.

> **Development/demo setup:** the current `docker-compose.yml` uses example database credentials and is not a production deployment configuration. Replace credentials and session secrets, configure HTTPS/cookies, restrict exposed ports, and establish backups before deploying publicly.

## Features

- Register, sign in, sign out, and retrieve the current user.
- Create, view, update, complete, and delete personal tasks.
- Give tasks a date, optional due time and description, and a status.
- Select a day from the week picker, navigate to previous/next weeks, or return to Today.
- Filter and sort tasks; use cursor-based pagination.
- Store sessions in PostgreSQL.
- Cache task list pages and summaries in Memcached. Mutations invalidate a user's list cache using versioned keys.
- Responsive React interface.

## Technology stack

- **Frontend:** React 19, React Router, Vite, Vanilla CSS.
- **Backend:** Node.js 24, Express 5, PostgreSQL (`pg`), `node-pg-migrate`, Zod, `express-session`, `connect-pg-simple`, bcrypt.
- **Cache:** Memcached.
- **Containers:** Docker Compose, PostgreSQL 15, Memcached 1.6, Nginx reverse proxy.

## Repository structure

```text
todo-list-app/
├── backend/
│   ├── migrations/              # PostgreSQL schema migrations
│   ├── src/
│   │   ├── app.js               # Express middleware and routes
│   │   ├── server.js            # DB check and server startup
│   │   ├── config/              # Environment configuration
│   │   ├── db/                  # PostgreSQL connection helpers
│   │   ├── middleware/          # Auth, validation, error handling
│   │   ├── modules/auth/        # Authentication routes and services
│   │   ├── modules/todos/       # Task routes, repository, service
│   │   └── utils/               # Memcached adapter
│   └── Dockerfile
├── front-end/
│   ├── src/
│   │   ├── components/
│   │   │   ├── molecules/       # Reusable UI groups and controls
│   │   │   ├── organisms/       # Composed task/page regions
│   │   │   └── templates/       # Page-level layout composition
│   │   ├── features/            # Domain actions and API requests
│   │   ├── hooks/               # Reusable React state/effect logic
│   │   ├── pages/               # Route-level orchestration
│   │   └── styles/              # CSS
│   └── Dockerfile
├── proxy/
│   ├── Dockerfile
│   └── nginx.conf               # Routes API requests and frontend traffic
├── docker-compose.yml
└── README.md
```

## Frontend architecture and Atomic Design

The frontend UI is organized using Brad Frost's Atomic Design vocabulary: **molecules, organisms, and templates**. This is a way to reason about the size and composition of interface components—not a requirement to create every possible layer or to move application logic into UI files. The project currently has no `atoms/` directory because the existing inputs, buttons, and labels do not yet need a separate shared abstraction. Add atoms when a small primitive has a real reuse or consistency benefit, rather than creating wrappers just to fill the hierarchy.

### UI layers and responsibilities

| Layer | Purpose | Components in this app |
| --- | --- | --- |
| `molecules/` | A small, reusable group of controls with a focused UI purpose. | `TaskFormFields` groups title, description, status, and due-time controls; `TaskModalShell` provides the shared dialog frame; `TaskListControls` composes sort and status controls; `StatusPicker` and `TimePicker` provide specialized controls; `SearchBar` is a standalone search/filter control. |
| `organisms/` | Larger, meaningful sections composed from smaller components. | `AddTaskModal` and `EditTodoModal` are complete task dialogs; `TodoItem` is a task row; `TodoList` is the list region; `WeekPicker`, `DayOverview`, `ProgressSummary`, and `TopBar` are larger screen sections. |
| `templates/` | Page-level layout composition, arranged without owning route-level data fetching. | `TodosTemplate` composes the top bar, sidebar, date controls, progress, task list, add dialog, and pagination. |
| `pages/` | Route-level orchestration that connects hooks and feature actions to a template. | `TodosPage` reads route/navigation context, owns page-specific view state, derives visible tasks, and passes data/callbacks into `TodosTemplate`. |

## Screenshots

### Sign in

![Todo List sign-in screen](front-end/docs/screenshots/login.png)

### Create an account

![Todo List registration screen](front-end/docs/screenshots/register.png)

### Tasks

![Todo List tasks dashboard](front-end/docs/screenshots/todos.png)

## Run with Docker Compose

### Requirements

- Docker Desktop or Docker Engine with Docker Compose.
- Host ports `80`, `11211`, and `5433` available. The API and frontend ports are internal to the Compose network.

From the repository root:

```bash
docker compose config
docker compose up --build -d
docker compose ps
```

Open <http://localhost>. Nginx routes `/api/...` requests to the backend and all other paths to the frontend. The browser talks to one origin; services communicate over Compose's internal network using service names such as `backend`, `front-end`, `postgres`, and `memcached`.

### Apply database migrations

The current Compose configuration does **not** automatically run migrations. After PostgreSQL and backend have started, run pending migrations once:

```bash
docker compose exec backend ./node_modules/.bin/node-pg-migrate up
```

Then inspect logs if needed:

```bash
docker compose logs -f postgres backend proxy front-end memcached
```

The database uses the named volume `postgres_data`; ordinary `docker compose down` preserves it. **Do not run `docker compose down -v` unless you intentionally want to delete the local database volume and its data.**

To stop containers while preserving the database:

```bash
docker compose down
```

### Compose services

| Service | Purpose | Host access |
| --- | --- | --- |
| `front-end` | Vite-built React app served with Vite Preview | Through proxy at `http://localhost` |
| `proxy` | Nginx routes UI and API requests | Port `80` |
| `backend` | Express API | Internal port `3000` |
| `postgres` | PostgreSQL database | `localhost:5433` |
| `memcached` | Task-list cache | `localhost:11211` |

Compose currently uses the demo database credentials `user` / `password` and database `todo`. **Do not use these in a deployed environment.**

## Run without Docker

### Start PostgreSQL and Memcached

Start local PostgreSQL and Memcached first. The backend template expects PostgreSQL at `localhost:5432` and Memcached at `localhost:11211`.

If you use the Compose database, it publishes PostgreSQL on host port `5433`; for a host-running API, set `DB_PORT=5433` and use a matching `DATABASE_URL`. The Compose Memcached service publishes port `11211`.

### Configure and run the backend

```bash
cp backend/.env.example backend/.env
```

Set the database fields/URL to match your PostgreSQL instance, set `CLIENT_URL=http://localhost:5173`, and replace `SESSION_SECRET` with a long random value. Then:

```bash
cd backend
npm ci
npm run db:up
npm run dev
```

API base URL: <http://localhost:3000/api/v1>. Health endpoint: <http://localhost:3000/api/v1/health>.

### Configure and run the frontend

Create `front-end/.env.local`:

```dotenv
VITE_API_URL=http://localhost:3000/api/v1
```

Then:

```bash
cd front-end
npm ci
npm run dev
```

Open <http://localhost:5173>. The backend's `CLIENT_URL` must match the frontend origin for credentialed CORS and session cookies to work.

## Environment variables

Backend settings are documented in [`backend/.env.example`](backend/.env.example).

| Variable | Purpose | Typical local value |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | API listen port | `3000` |
| `CLIENT_URL` | Allowed browser origin for credentialed CORS | `http://localhost:5173` locally; `http://localhost` via Compose proxy |
| `DB_HOST`, `DB_PORT` | PostgreSQL address | `localhost`, `5432` outside Compose; `postgres`, `5432` inside |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL credentials/database | Must match your database; Compose defaults are demo-only |
| `DATABASE_URL` | Optional full PostgreSQL URL; takes precedence over DB fields | For example `postgresql://user:password@localhost:5432/todo` |
| `SESSION_SECRET` | Session signing secret | Use a unique long random value; never publish it |
| `SESSION_SECURE` | Enable secure cookie flag for HTTPS | `false` for local HTTP |
| `SESSION_MAX_AGE_MS` | Session lifetime in milliseconds | `86400000` |
| `MEMCACHED_SERVERS` | Memcached server list | `localhost:11211` outside Compose; `memcached:11211` inside |
| `MEMCACHED_TODO_LIST_TTL_SECONDS` | Task-list cache lifetime | `60` |

The frontend reads `VITE_API_URL`, which is embedded in the Vite bundle at build time. The Dockerfile defaults to `/api/v1` for the Nginx proxy setup; standalone local Vite uses `http://localhost:3000/api/v1`.

## API overview

API prefix: `/api/v1`. Authenticated calls use the session cookie; browser fetch requests include credentials.

### Health

- `GET /api/v1/health`

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Tasks

- `GET /api/v1/todos` — list tasks; supports date and cursor pagination query parameters.
- `POST /api/v1/todos` — create a task.
- `GET /api/v1/todos/:id` — fetch a task.
- `PATCH /api/v1/todos/:id` — update a task.
- `DELETE /api/v1/todos/:id` — delete a task.

Zod schemas validate request bodies, route parameters, and query parameters. See the backend route/schema/controller files for exact request and response formats.

## Memcached behavior

The task-list cache uses cache-aside:

1. A key is scoped by user, date, page size, cursor, and a per-user version token.
2. On a hit, the backend returns the cached page and summary. On a miss, it queries PostgreSQL and caches the result for the configured TTL.
3. Creating, updating, or deleting a task changes that user's version token; old list keys become unreachable without wildcard deletion.
4. Cache errors fall back to PostgreSQL. The database remains authoritative.

Memcached is ephemeral; restarting its container may clear cached entries but does not delete tasks.

## Troubleshooting

- **CORS/API errors:** check that `CLIENT_URL` exactly matches the browser origin. Via Compose, open `http://localhost`; frontend API requests should use `/api/v1`.
- **Cannot connect to DB/cache from a container:** use Compose service names (`postgres`, `memcached`), not `localhost`.
- **Missing database tables:** apply migrations using the command above and inspect backend/PostgreSQL logs.
- **Frontend bundle did not change:** rebuild the image with `docker compose up --build -d front-end`.
- **Port 80 is occupied:** change the host side of the proxy mapping, e.g. `8080:80`, and access <http://localhost:8080>.

## Security and deployment notes

- Replace sample DB credentials and configure `SESSION_SECRET` through a secret manager or runtime environment injection.
- Use HTTPS and secure cookies when deployed behind a correctly configured TLS proxy.
- Do not publicly expose PostgreSQL or Memcached; publish only the required web entry point.
- Configure database backups, retention, and monitoring.
- The current frontend image uses Vite Preview for convenience. For a hardened production deployment, serve the built static files with a production web server.
- Add database health checks and a dedicated one-shot migration job before treating this Compose setup as production-ready.
