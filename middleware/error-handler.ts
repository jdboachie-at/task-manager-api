import type { Request, Response, NextFunction } from "express"

type AppError = Error & {
	status?: number
	errors?: unknown
}

export default function errorHandler(
	err: AppError,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	const status = err.status || 500
	const isProd = process.env.NODE_ENV === "production"
	const message =
		status >= 500 && isProd
			? "Internal server error"
			: err.message || "Internal server error"

	const response: {
		success: false
		message: string
		errors?: unknown
		stack?: string
	} = {
		success: false,
		message,
	}

	if (err.errors !== undefined) {
		response.errors = err.errors
	}

	if (!isProd && err.stack) {
		response.stack = err.stack
	}

	if (status >= 500) {
		console.error(err)
	}

	return res.status(status).json(response)
}
