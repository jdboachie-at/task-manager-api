import type { Request, Response } from "express"

import * as users from "../models/user"

export async function listUsers(_req: Request, res: Response) {
	return res.status(200).json({
		success: true,
		message: "Users fetched successfully",
		data: users.listUsers(),
	})
}
