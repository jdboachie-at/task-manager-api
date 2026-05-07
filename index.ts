import express from "express"
import { errorHandler, logger, notFound } from "./middleware"
import { connectToDatabase, disconnectFromDatabase } from "./config/db"
import { authRoutes } from "./routes/auth.routes"
import { taskRoutes } from "./routes/task.routes"

const app = express()
const port = Number.parseInt(process.env.PORT || "", 10) || 8000

app.use(express.json())
app.use(logger)

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

app.use(notFound)
app.use(errorHandler)

async function main() {
	await connectToDatabase()

	app.listen(port, () => {
		console.log(`Server listening on port ${port}`)
	})
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})

process.on("SIGINT", async () => {
	await disconnectFromDatabase()
	process.exit(0)
})

process.on("SIGTERM", async () => {
	await disconnectFromDatabase()
	process.exit(0)
})
