import mongoose, { type InferSchemaType } from "mongoose"

const taskSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	completed: { type: Boolean, default: false },
	createdAt: {
		type: Date,
		immutable: true,
		default: Date.now,
	},
})

export type Task = InferSchemaType<typeof taskSchema>
export const Task = mongoose.model<Task>("Task", taskSchema)
