# task-manager-api

Task Tracker API with JWT authentication and role-based access control, built with Bun, Express 5, and SQLite (`bun:sqlite`, no database server needed).

## Setup

```bash
bun install
```

Create a `.env` file (never commit it):

```
PORT=8000
DB_URI=data.db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
```

The SQLite database file is created automatically on first run.

Run:

```bash
bun run dev
```

## Authentication

Register, then log in to receive a JWT. Send it on protected routes:

```
Authorization: Bearer <token>
```

Tokens expire after `JWT_EXPIRES_IN` (default 1h). Passwords are hashed with bcrypt before storage.

## Endpoints

### Auth (public)

| Method | Endpoint             | Description                     |
| ------ | -------------------- | ------------------------------- |
| POST   | `/api/auth/register` | Register (name, email, password) |
| POST   | `/api/auth/login`    | Log in, returns JWT             |

### Tasks (require JWT)

| Method | Endpoint         | Access                          |
| ------ | ---------------- | ------------------------------- |
| GET    | `/api/tasks`     | Own tasks (admin: all tasks)    |
| GET    | `/api/tasks/:id` | Owner or admin                  |
| POST   | `/api/tasks`     | Any authenticated user          |
| PUT    | `/api/tasks/:id` | Owner or admin                  |
| DELETE | `/api/tasks/:id` | Owner or admin                  |

### Users (admin only)

| Method | Endpoint     | Access |
| ------ | ------------ | ------ |
| GET    | `/api/users` | Admin  |

## Roles & permissions

Roles assign, permissions authorize: each user has a role, a static map in
`utils/permissions.ts` resolves it to a permission set, and routes
check permissions (`requirePermission`) rather than roles. Own-task CRUD is
a baseline every authenticated user has — only discriminating abilities are
named:

| Role  | Permissions                      |
| ----- | -------------------------------- |
| user  | — (own tasks only)               |
| admin | `users:read`, `tasks:manage:all` |

New registrations are always `user`; promote to admin directly in the database:

```bash
bun -e "import {Database} from 'bun:sqlite'; new Database('data.db').run(\"UPDATE users SET role='admin' WHERE email='you@example.com'\")"
```

## Errors

All errors return consistent JSON with appropriate status codes:

```json
{ "success": false, "message": "Token expired" }
```

- `400` validation failed
- `401` invalid credentials / missing, invalid, or expired token
- `403` authenticated but not allowed (e.g. non-admin on `/api/users`)
- `404` not found (including another user's task)
