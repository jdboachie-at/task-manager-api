import type { Request, Response, NextFunction } from "express"

export default function logger(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const { method, originalUrl } = req
	res.on("finish", () => {
		const timestamp = new Date().toISOString()
		console.log(`${timestamp} ${method} ${res.statusCode} ${originalUrl}`)
	})
	next()
}
