import express from "express"
import * as controller from "../controllers/task-controller"

export const taskRoutes = express.Router()

taskRoutes.get("/", controller.list)
taskRoutes.get("/:id", controller.getOne)
taskRoutes.post("/", controller.create)
taskRoutes.put("/:id", controller.update)
taskRoutes.delete("/:id", controller.remove)
