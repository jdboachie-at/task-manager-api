import bcrypt from "bcrypt"
import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { z } from "zod"

import { User } from "../models/user"
import { AppError } from "../utils/app-error"

const createUserSchema = z.object({
	name: z.string(),
	email: z.email(),
	password: z.string(),
})

const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
})

export async function register(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const parseResult = createUserSchema.safeParse(req.body)

		if (!parseResult.success) {
			return next(
				new AppError(
					"Validation failed",
					400,
					z.treeifyError(parseResult.error),
				),
			)
		}

		const user = await User.create(parseResult.data)

		return res.status(201).json({
			success: true,
			message: "User created successfully",
			data: user,
		})
	} catch (error) {
		return next(error)
	}
}

export async function login(req: Request, res: Response, next: NextFunction) {
	try {
		const parseResult = loginSchema.safeParse(req.body)

		if (!parseResult.success) {
			return next(
				new AppError(
					"Validation failed",
					400,
					z.treeifyError(parseResult.error),
				),
			)
		}

		const email = parseResult.data.email
		const user = await User.findOne({ email }).select("+password")

		if (!user) {
			next(new AppError("Invalid credentials", 401))
			return
		}

		const passwordOk = await bcrypt.compare(
			parseResult.data.password,
			user.password,
		)

		if (!passwordOk) {
			next(new AppError("Invalid credentials", 401))
			return
		}

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET!,
			{ expiresIn: "1h" },
		)

		return res.status(200).json({
			success: true,
			message: "Logged in successfully",
			token,
			data: { user: { ...user, password: undefined } },
		})
	} catch (error) {
		return next(error)
	}
}
