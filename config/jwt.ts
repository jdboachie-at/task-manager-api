import type jwt from "jsonwebtoken"

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable is required")
}

export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
	"1h") as jwt.SignOptions["expiresIn"]
