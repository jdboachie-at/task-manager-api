import type { Request, Response } from "express"
import { z } from "zod"

import type { AuthPayload } from "../middleware/auth-middleware"
import * as tasks from "../models/task"
import { AppError } from "../utils/app-error"
import { hasPermission } from "../utils/permissions"

const createTaskSchema = z.object({
	title: z.string().min(1, "Title is required"),
	completed: z.boolean().default(false),
})

const updateTaskSchema = createTaskSchema.partial()

const idSchema = z.coerce.number().int()

// Without tasks:manage:all, queries are scoped to the requester's own tasks.
// Scoping the query means another user's task looks like a 404 instead of
// leaking its existence.
function scopeFor(user: AuthPayload): number | null {
	return hasPermission(user, "tasks:manage:all") ? null : user.id
}

function parseId(raw: string): number {
	const result = idSchema.safeParse(raw)
	if (!result.success) {
		throw new AppError("Task not found", 404)
	}
	return result.data
}

export async function list(req: Request, res: Response) {
	return res.status(200).json({
		success: true,
		message: "Tasks fetched successfully",
		data: tasks.listTasks(scopeFor(req.user!)),
	})
}

export async function getOne(req: Request<{ id: string }>, res: Response) {
	const task = tasks.getTask(parseId(req.params.id), scopeFor(req.user!))

	if (!task) {
		throw new AppError("Task not found", 404)
	}

	return res.status(200).json({
		success: true,
		message: "Task fetched successfully",
		data: task,
	})
}

export async function create(req: Request, res: Response) {
	const parseResult = createTaskSchema.safeParse(req.body)

	if (!parseResult.success) {
		throw new AppError(
			"Validation failed",
			400,
			z.treeifyError(parseResult.error),
		)
	}

	const task = tasks.createTask(
		parseResult.data.title,
		parseResult.data.completed,
		req.user!.id,
	)

	return res.status(201).json({
		success: true,
		message: "Task created successfully",
		data: task,
	})
}

export async function update(req: Request<{ id: string }>, res: Response) {
	const parseResult = updateTaskSchema.safeParse(req.body)

	if (!parseResult.success) {
		throw new AppError(
			"Validation failed",
			400,
			z.treeifyError(parseResult.error),
		)
	}

	const updatedTask = tasks.updateTask(
		parseId(req.params.id),
		parseResult.data,
		scopeFor(req.user!),
	)

	if (!updatedTask) {
		throw new AppError("Task not found", 404)
	}

	return res.status(200).json({
		success: true,
		message: "Task updated successfully",
		data: updatedTask,
	})
}

export async function remove(req: Request<{ id: string }>, res: Response) {
	const deletedTask = tasks.deleteTask(
		parseId(req.params.id),
		scopeFor(req.user!),
	)

	if (!deletedTask) {
		throw new AppError("Task not found", 404)
	}

	return res.status(200).json({
		success: true,
		message: "Task deleted successfully",
		data: deletedTask,
	})
}
