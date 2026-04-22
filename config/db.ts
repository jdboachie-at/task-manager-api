import "dotenv/config"
import mongoose from "mongoose"

export async function connectToDatabase() {
	const MONGODB_URI = process.env.MONGODB_URI

	if (!MONGODB_URI) {
		throw new Error("MONGODB_URI not set")
	}

	await mongoose.connect(MONGODB_URI)
}

export async function disconnectFromDatabase() {
	await mongoose.disconnect()
}
