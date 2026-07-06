import bcrypt from "bcrypt"
import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { z } from "zod"

import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/jwt"
import { createUser, findUserByEmail } from "../models/user"
import { AppError } from "../utils/app-error"

const SALT_ROUNDS = 10

const createUserSchema = z.object({
	name: z.string(),
	email: z.email(),
	password: z.string().min(8, "Password must be at least 8 characters"),
})

const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
})

export async function register(req: Request, res: Response) {
	const parseResult = createUserSchema.safeParse(req.body)

	if (!parseResult.success) {
		throw new AppError(
			"Validation failed",
			400,
			z.treeifyError(parseResult.error),
		)
	}

	const { name, email, password } = parseResult.data
	const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

	let user
	try {
		user = createUser(name, email, passwordHash)
	} catch (error) {
		if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") {
			throw new AppError("Email already registered", 409)
		}
		throw error
	}

	return res.status(201).json({
		success: true,
		message: "User created successfully",
		data: user,
	})
}

export async function login(req: Request, res: Response) {
	const parseResult = loginSchema.safeParse(req.body)

	if (!parseResult.success) {
		throw new AppError(
			"Validation failed",
			400,
			z.treeifyError(parseResult.error),
		)
	}

	const user = findUserByEmail(parseResult.data.email)

	if (!user) {
		throw new AppError("Invalid credentials", 401)
	}

	const passwordOk = await bcrypt.compare(
		parseResult.data.password,
		user.password,
	)

	if (!passwordOk) {
		throw new AppError("Invalid credentials", 401)
	}

	const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN,
	})

	const { password: _, ...safeUser } = user

	return res.status(200).json({
		success: true,
		message: "Logged in successfully",
		token,
		data: { user: safeUser },
	})
}
