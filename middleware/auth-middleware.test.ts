import { describe, expect, test } from "bun:test"
import jwt from "jsonwebtoken"
import type { NextFunction, Request, Response } from "express"

import { requireAuth, requirePermission } from "./auth-middleware"
import type { AppError } from "../utils/app-error"
import { hasPermission } from "../utils/permissions"

process.env.JWT_SECRET ||= "test-secret"

function run(
	mw: (req: Request, res: Response, next: NextFunction) => void,
	headers: Record<string, string> = {},
	user?: Request["user"],
) {
	const req = { headers, user } as Request
	let error: AppError | undefined
	mw(
		req,
		{} as Response,
		((err?: AppError) => {
			error = err
		}) as NextFunction,
	)
	return { req, error }
}

const sign = (opts: jwt.SignOptions = {}) =>
	jwt.sign({ id: 1, role: "user" }, process.env.JWT_SECRET!, opts)

describe("requireAuth", () => {
	test("missing header → 401", () => {
		expect(run(requireAuth).error?.status).toBe(401)
	})

	test("invalid token → 401", () => {
		const { error } = run(requireAuth, { authorization: "Bearer garbage" })
		expect(error?.status).toBe(401)
		expect(error?.message).toBe("Invalid token")
	})

	test("expired token → 401 with expired message", () => {
		const token = sign({ expiresIn: -10 })
		const { error } = run(requireAuth, { authorization: `Bearer ${token}` })
		expect(error?.status).toBe(401)
		expect(error?.message).toBe("Token expired")
	})

	test("valid token → attaches user", () => {
		const { req, error } = run(requireAuth, {
			authorization: `Bearer ${sign()}`,
		})
		expect(error).toBeUndefined()
		expect(req.user).toEqual({ id: 1, role: "user" })
	})
})

describe("requirePermission", () => {
	test("role without permission → 403", () => {
		const { error } = run(
			requirePermission("users:read"),
			{},
			{ id: 1, role: "user" },
		)
		expect(error?.status).toBe(403)
	})

	test("role with permission → passes", () => {
		const { error } = run(
			requirePermission("users:read"),
			{},
			{ id: 1, role: "admin" },
		)
		expect(error).toBeUndefined()
	})
})

describe("hasPermission", () => {
	test("admin can manage all tasks, user cannot", () => {
		expect(hasPermission({ role: "admin" }, "tasks:manage:all")).toBe(true)
		expect(hasPermission({ role: "user" }, "tasks:manage:all")).toBe(false)
		expect(hasPermission(undefined, "tasks:manage:all")).toBe(false)
	})
})
