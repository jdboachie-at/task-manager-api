const tasks = [
  { id: 1, title: "Read 10 pages", completed: false },
  { id: 2, title: "Walk for 20 minutes", completed: false },
  { id: 3, title: "Plan tomorrow", completed: false },
];

let nextId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;

function findAll() {
  return tasks;
}

function findById(id) {
  return tasks.find((t) => t.id === id);
}

function create({ title, completed = false }) {
  const task = { id: nextId++, title, completed };
  tasks.push(task);
  return task;
}

function update(id, patch) {
  const task = findById(id);
  if (!task) return null;
  Object.assign(task, patch);
  return task;
}

function remove(id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
