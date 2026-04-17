# Task Manager API

A simple RESTful API for managing tasks, built with Express.js. Tasks are stored in memory (no database).

## Setup

```bash
npm install
cp .env.example .env   # then edit PORT if needed
npm run dev            # start with --watch
# or
npm start              # start once
```

## Environment variables

| Variable | Description        | Default |
| -------- | ------------------ | ------- |
| `PORT`   | HTTP port to bind  | `3000`  |

## Project structure

```
task-manager-api/
├── app.js                      # App setup, middleware wiring, server start
├── routes/
│   └── taskRoutes.js           # /api/tasks router
├── controllers/
│   └── taskController.js       # CRUD handler logic + input validation
├── models/
│   └── taskStore.js            # In-memory task store
├── middleware/
│   ├── logger.js               # Request logger
│   ├── notFound.js             # 404 catch-all
│   └── errorHandler.js         # Global error handler
└── .env                        # PORT, etc.
```

## API reference

Base path: `/api/tasks`

| Method | Path                | Description          | Success | Errors                |
| ------ | ------------------- | -------------------- | ------- | --------------------- |
| GET    | `/api/tasks`        | List all tasks       | 200     | —                     |
| GET    | `/api/tasks/:id`    | Get one task         | 200     | 400, 404              |
| POST   | `/api/tasks`        | Create a task        | 201     | 400                   |
| PUT    | `/api/tasks/:id`    | Update a task        | 200     | 400, 404              |
| DELETE | `/api/tasks/:id`    | Delete a task        | 204     | 400, 404              |

Unknown routes return `404 {"error":"not found"}`. Unexpected errors return `500 {"error":"..."}` via the global error handler.

### Task shape

```json
{ "id": 1, "title": "Read 10 pages", "completed": false }
```

### Examples

```bash
# List
curl http://localhost:3000/api/tasks

# Get one
curl http://localhost:3000/api/tasks/1

# Create (title required; completed optional boolean)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries"}'

# Update (at least one of title / completed required)
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete
curl -X DELETE http://localhost:3000/api/tasks/1
```

### Error response shape

```json
{ "error": "title must be a non-empty string" }
```
