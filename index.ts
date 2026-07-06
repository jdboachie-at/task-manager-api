import "dotenv/config"
import express from "express"
import errorHandler from "./middleware/error-handler"
import logger from "./middleware/logger"
import notFound from "./middleware/not-found"
import { authRoutes } from "./routes/auth.routes"
import { taskRoutes } from "./routes/task.routes"
import { userRoutes } from "./routes/user.routes"

const app = express()
const port = Number.parseInt(process.env.PORT || "", 10) || 8000

app.use(express.json())
app.use(logger)

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/users", userRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
