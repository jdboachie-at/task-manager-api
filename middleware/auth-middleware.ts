import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

import { JWT_SECRET } from "../config/jwt"
import { AppError } from "../utils/app-error"
import { hasPermission, type Permission, type Role } from "../utils/permissions"

export type AuthPayload = {
	id: number
	role: Role
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthPayload
		}
	}
}

export function requireAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	const header = req.headers.authorization

	if (!header?.startsWith("Bearer ")) {
		return next(new AppError("Authentication token missing", 401))
	}

	try {
		const payload = jwt.verify(
			header.slice("Bearer ".length),
			JWT_SECRET,
		) as AuthPayload

		req.user = { id: payload.id, role: payload.role }
		return next()
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return next(new AppError("Token expired", 401))
		}
		return next(new AppError("Invalid token", 401))
	}
}

export function requirePermission(permission: Permission) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!hasPermission(req.user, permission)) {
			return next(new AppError("Unauthorized access", 403))
		}
		return next()
	}
}
