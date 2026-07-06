import { db } from "../config/db"
import type { Role } from "../utils/permissions"

export type User = {
	id: number
	name: string
	email: string
	role: Role
	created_at: string
}

const PUBLIC_COLUMNS = "id, name, email, role, created_at"

export function createUser(
	name: string,
	email: string,
	passwordHash: string,
): User {
	return db
		.query(
			`INSERT INTO users (name, email, password) VALUES (?, ?, ?)
			 RETURNING ${PUBLIC_COLUMNS}`,
		)
		.get(name, email, passwordHash) as User
}

export function findUserByEmail(
	email: string,
): (User & { password: string }) | null {
	return db
		.query(`SELECT ${PUBLIC_COLUMNS}, password FROM users WHERE email = ?`)
		.get(email) as (User & { password: string }) | null
}

export function listUsers(): User[] {
	return db.query(`SELECT ${PUBLIC_COLUMNS} FROM users`).all() as User[]
}
