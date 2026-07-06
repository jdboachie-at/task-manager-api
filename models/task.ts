import { db } from "../config/db"

export type Task = {
	id: number
	title: string
	completed: boolean
	user_id: number
	created_at: string
}

type TaskRow = Omit<Task, "completed"> & { completed: 0 | 1 }

const toTask = (row: TaskRow | null): Task | null =>
	row && { ...row, completed: !!row.completed }

// ownerId scopes queries to that user's tasks; null means no scoping (admin).
// user_id = COALESCE(NULL, user_id) is always true, so null matches all rows.

export function listTasks(ownerId: number | null): Task[] {
	return (
		db
			.query("SELECT * FROM tasks WHERE user_id = COALESCE(?, user_id)")
			.all(ownerId) as TaskRow[]
	).map((row) => toTask(row)!)
}

export function getTask(id: number, ownerId: number | null): Task | null {
	return toTask(
		db
			.query(
				"SELECT * FROM tasks WHERE id = ? AND user_id = COALESCE(?, user_id)",
			)
			.get(id, ownerId) as TaskRow | null,
	)
}

export function createTask(
	title: string,
	completed: boolean,
	userId: number,
): Task {
	return toTask(
		db
			.query(
				"INSERT INTO tasks (title, completed, user_id) VALUES (?, ?, ?) RETURNING *",
			)
			.get(title, completed ? 1 : 0, userId) as TaskRow,
	)!
}

export function updateTask(
	id: number,
	patch: { title?: string; completed?: boolean },
	ownerId: number | null,
): Task | null {
	return toTask(
		db
			.query(
				`UPDATE tasks
				 SET title = COALESCE(?, title), completed = COALESCE(?, completed)
				 WHERE id = ? AND user_id = COALESCE(?, user_id)
				 RETURNING *`,
			)
			.get(
				patch.title ?? null,
				patch.completed === undefined ? null : patch.completed ? 1 : 0,
				id,
				ownerId,
			) as TaskRow | null,
	)
}

export function deleteTask(id: number, ownerId: number | null): Task | null {
	return toTask(
		db
			.query(
				"DELETE FROM tasks WHERE id = ? AND user_id = COALESCE(?, user_id) RETURNING *",
			)
			.get(id, ownerId) as TaskRow | null,
	)
}
