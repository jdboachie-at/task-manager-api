export class AppError extends Error {
	public status: number
	public errors?: unknown

	constructor(message: string, status = 500, errors?: unknown) {
		super(message)
		this.name = "AppError"
		this.status = status
		this.errors = errors

		Object.setPrototypeOf(this, AppError.prototype)
	}
}
