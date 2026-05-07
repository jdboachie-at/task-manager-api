import bcrypt from "bcrypt"
import type { NextFunction } from "express"
import mongoose, { type InferSchemaType } from "mongoose"

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		role: {
			type: String,
			default: "user",
		},
	},
	{
		toJSON: {
			transform(_doc, ret) {
				delete ret.password
				return ret
			},
		},
	},
)

userSchema.pre("save", async function (next: NextFunction) {
	try {
		if (!this.isModified("password")) {
			return next()
		}
		const saltRounds = 10
		this.password = await bcrypt.hash(this.password, saltRounds)
	} catch (error) {
		next(error)
	}
})

export type User = InferSchemaType<typeof userSchema>
export const User = mongoose.model<User>("User", userSchema)
