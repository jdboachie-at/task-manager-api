import type { Request, Response, NextFunction } from "express"

export default function logger(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	res.on("finish", () => {
		console.log(
			`${new Date().toISOString()} ${req.method} ${res.statusCode} ${req.originalUrl}`,
		)
	})
	next()
}
