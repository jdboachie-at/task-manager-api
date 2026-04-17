const express = require("express");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const method = req.method;
  const path = req.originalUrl;

  res.on("finish", () => {
    console.log(`${method} ${res.statusCode} ${path}`);
  });

  next();
});

const tasks = [
  { id: 1, title: "Read 10 pages", completed: false },
  { id: 2, title: "Walk for 20 minutes", completed: false },
  { id: 3, title: "Plan tomorrow", completed: false },
];

let nextId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) ? id : null;
}

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ error: "task not found" });

  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "task not found" });

  res.json(task);
});

app.post("/tasks", (req, res) => {
  const title =
    typeof req.body?.title === "string" ? req.body.title.trim() : "";

  if (!title) return res.status(400).json({ error: "title is required" });

  const task = { id: nextId++, title, completed: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.delete("/tasks/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ error: "task not found" });

  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "task not found" });

  tasks.splice(idx, 1);
  res.status(204).send();
});

const port = 3000;
app.listen(port, () => {
  console.log(`Task Manager API listening on http://localhost:${port}`);
});
