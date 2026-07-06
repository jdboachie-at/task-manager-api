export type Role = "user" | "admin"
export type Permission = "users:read" | "tasks:manage:all"

// Baseline abilities (own-task CRUD)
// belong to every authenticated user and aren't encoded here
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
	user: [],
	admin: ["users:read", "tasks:manage:all"],
}

export function hasPermission(
	user: { role: Role } | undefined,
	permission: Permission,
): boolean {
	return !!user && ROLE_PERMISSIONS[user.role].includes(permission)
}
