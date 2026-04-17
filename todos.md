# Task Manager API — Lab Completion TODOs

Vertical slices to bring the project from its current state (single [app.js](app.js), 42/100) to full compliance with the lab rubric. Each slice is demoable end-to-end on its own.

---

## TODO 1 — Load port from `.env` via dotenv

**Type:** AFK

### What to build

Replace the hardcoded `port = 3000` in [app.js](app.js) with a value read from `process.env.PORT`, loaded via the `dotenv` package. Create a `.env` file (gitignored) and a committed `.env.example` documenting required variables.

### Acceptance criteria

- [ ] `dotenv` installed and listed in `package.json` dependencies
- [ ] `.env` contains `PORT=3000` and is ignored by git
- [ ] `.env.example` is committed and documents `PORT`
- [ ] `require("dotenv").config()` runs before `app.listen`
- [ ] Server starts on the port from `.env`; falls back to a sensible default if unset
- [ ] Startup log prints the port actually used

### Blocked by

None — can start immediately.

### Rubric coverage

- Project Setup (10%)
- Environment Management

---

## TODO 2 — Mount routes under `/api/tasks` and add `PUT /api/tasks/:id`

**Type:** AFK

### What to build

Move all existing task routes from `/tasks` to `/api/tasks` and add the missing `PUT /api/tasks/:id` endpoint that updates `title` and/or `completed` on an existing task.

### Acceptance criteria

- [ ] `GET /api/tasks` returns all tasks (200)
- [ ] `GET /api/tasks/:id` returns one task (200) or 404 if missing
- [ ] `POST /api/tasks` creates a task (201) or 400 if `title` missing/invalid
- [ ] `PUT /api/tasks/:id` updates `title` and/or `completed`, returns updated task (200); 404 if not found; 400 if body invalid
- [ ] `DELETE /api/tasks/:id` removes a task (204) or 404 if missing
- [ ] Malformed IDs (non-numeric) return 400, not 404
- [ ] All endpoints verified with curl/Postman

### Blocked by

None — can start immediately.

### Rubric coverage

- Routing & Parameters (20%)
- Response Format (10%)

---

## TODO 3 — Refactor into MVC folder structure

**Type:** AFK

### What to build

Split [app.js](app.js) into MVC layers:

- `/controllers/taskController.js` — CRUD handler functions
- `/routes/taskRoutes.js` — `express.Router()` mapping endpoints → controllers
- `/models/tasks.js` (or similar) — in-memory task store + `nextId` helper
- `app.js` wires middleware + routers + listen only

Behavior must remain identical to TODO 2.

### Acceptance criteria

- [ ] `/controllers`, `/routes`, `/middleware` directories exist
- [ ] `app.js` contains no route-handler logic — only app setup
- [ ] Route file contains no business logic — only `router.METHOD(path, controller)` lines
- [ ] In-memory store lives in its own module, imported by the controller
- [ ] All endpoints still pass the TODO 2 acceptance tests

### Blocked by

- Blocked by TODO 2

### Rubric coverage

- MVC Structure (15%)
- Code Quality & Clarity (15%)

---

## TODO 4 — Extract logger middleware to its own module

**Type:** AFK

### What to build

Move the inline request logger from [app.js](app.js) into `/middleware/logger.js`. Log method, path, status, and an ISO timestamp on request finish.

### Acceptance criteria

- [ ] `middleware/logger.js` exports a single middleware function
- [ ] `app.js` imports and mounts it via `app.use`
- [ ] Each request logs `<ISO-timestamp> <METHOD> <STATUS> <PATH>`
- [ ] Logger runs before route handlers

### Blocked by

- Blocked by TODO 3

### Rubric coverage

- Middleware Usage (15%)

---

## TODO 5 — Add 404 handler and global error-handler middleware

**Type:** AFK

### What to build

Add two final middlewares in `app.js`:

1. A catch-all 404 handler for undefined routes that returns `{ error: "not found" }`.
2. A global error handler `(err, req, res, next)` in `/middleware/errorHandler.js` that returns a consistent `{ error: <message> }` JSON payload with an appropriate status code (defaults to 500). Controllers should forward errors via `next(err)`.

### Acceptance criteria

- [ ] `middleware/errorHandler.js` exports a 4-arg error middleware
- [ ] 404 middleware mounted after all routes, before the error handler
- [ ] Unknown paths (e.g. `GET /nope`) return JSON 404
- [ ] Thrown/async errors in controllers reach the global handler and return JSON 500
- [ ] Error responses never leak stack traces in production mode

### Blocked by

- Blocked by TODO 3

### Rubric coverage

- Middleware Usage (15%)
- Error Handling (15%)

---

## TODO 6 — Input validation with proper 400 responses

**Type:** AFK

### What to build

Tighten controller validation so bad input consistently returns 400 with a descriptive JSON error:

- `POST /api/tasks` — `title` required, must be non-empty string; `completed` if present must be boolean
- `PUT /api/tasks/:id` — at least one of `title` / `completed` required; types validated
- `:id` param — non-numeric returns 400 "invalid id"; numeric-but-missing returns 404

### Acceptance criteria

- [ ] Empty body on POST → 400
- [ ] `completed: "yes"` (wrong type) → 400
- [ ] `PUT` with empty body → 400
- [ ] `GET /api/tasks/abc` → 400 (not 404)
- [ ] `GET /api/tasks/999` (not found) → 404
- [ ] All error responses shaped as `{ error: string }`

### Blocked by

- Blocked by TODO 3, TODO 5

### Rubric coverage

- Error Handling (15%)
- Response Format (10%)

---

## TODO 7 — README with setup and API docs

**Type:** AFK

### What to build

Replace the near-empty [README.md](README.md) with setup instructions, environment variable docs, and a short API reference table (method, path, description, status codes, sample body).

### Acceptance criteria

- [ ] Install / run instructions (`npm install`, `npm run dev`, `npm start`)
- [ ] `.env` variable list
- [ ] Endpoint table covering all 5 CRUD routes
- [ ] At least one curl example per endpoint
- [ ] Folder-structure diagram showing MVC layout

### Blocked by

- Blocked by TODO 3, TODO 5, TODO 6

### Rubric coverage

- Code Quality & Clarity (15%)
