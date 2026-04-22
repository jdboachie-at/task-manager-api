import type { NextFunction, Request, Response } from "express"
import { z } from "zod"

import { Task } from "../models/task"
import { AppError } from "../utils/app-error"

const createTaskSchema = z.object({
	title: z.string().min(1, "Title is required"),
	completed: z.boolean().default(false),
})

const updateTaskSchema = createTaskSchema.partial()

export async function list(_req: Request, res: Response, next: NextFunction) {
	try {
		const tasks = await Task.find().lean()

		return res.status(200).json({
			success: true,
			message: "Tasks fetched successfully",
			data: tasks,
		})
	} catch (error) {
		return next(error)
	}
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
	try {
		const task = await Task.findById(req.params.id).lean()

		if (!task) {
			return next(new AppError("Task not found", 404))
		}

		return res.status(200).json({
			success: true,
			message: "Task fetched successfully",
			data: task,
		})
	} catch (error) {
		return next(error)
	}
}

export async function create(req: Request, res: Response, next: NextFunction) {
	try {
		const parseResult = createTaskSchema.safeParse(req.body)

		if (!parseResult.success) {
			return next(
				new AppError(
					"Validation failed",
					400,
					z.treeifyError(parseResult.error),
				),
			)
		}

		const task = await Task.create(parseResult.data)

		return res.status(201).json({
			success: true,
			message: "Task created successfully",
			data: task,
		})
	} catch (error) {
		return next(error)
	}
}

export async function update(req: Request, res: Response, next: NextFunction) {
	try {
		const parseResult = updateTaskSchema.safeParse(req.body)

		if (!parseResult.success) {
			return next(
				new AppError(
					"Validation failed",
					400,
					z.treeifyError(parseResult.error),
				),
			)
		}

		const updatedTask = await Task.findByIdAndUpdate(
			req.params.id,
			parseResult.data,
			{ new: true },
		).lean()

		if (!updatedTask) {
			return next(new AppError("Task not found", 404))
		}

		return res.status(200).json({
			success: true,
			message: "Task updated successfully",
			data: updatedTask,
		})
	} catch (error) {
		return next(error)
	}
}

export async function remove(req: Request, res: Response, next: NextFunction) {
	try {
		const deletedTask = await Task.findByIdAndDelete(req.params.id).lean()

		if (!deletedTask) {
			return next(new AppError("Task not found", 404))
		}

		return res.status(200).json({
			success: true,
			message: "Task deleted successfully",
			data: deletedTask,
		})
	} catch (error) {
		return next(error)
	}
}
