const store = require("../models/taskStore");

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) ? id : null;
}

function list(req, res) {
  res.json(store.findAll());
}

function getOne(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "invalid id" });

  const task = store.findById(id);
  if (!task) return res.status(404).json({ error: "task not found" });

  res.json(task);
}

function create(req, res) {
  const { title, completed } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title must be a non-empty string" });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed must be a boolean" });
  }

  const task = store.create({
    title: title.trim(),
    completed: completed ?? false,
  });
  res.status(201).json(task);
}

function update(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "invalid id" });

  const task = store.findById(id);
  if (!task) return res.status(404).json({ error: "task not found" });

  const { title, completed } = req.body ?? {};

  if (title === undefined && completed === undefined) {
    return res
      .status(400)
      .json({ error: "title or completed is required" });
  }

  const patch = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title must be a non-empty string" });
    }
    patch.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "completed must be a boolean" });
    }
    patch.completed = completed;
  }

  res.json(store.update(id, patch));
}

function remove(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "invalid id" });

  if (!store.remove(id)) {
    return res.status(404).json({ error: "task not found" });
  }

  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };
