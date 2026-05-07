import type { Request, Response, NextFunction } from "express"

export default function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const { method, originalUrl } = req

	next()
}
