import express from "express"
import * as controller from "../controllers/task-controller"

export const router = express.Router()

router.get("/", controller.list)
router.get("/:id", controller.getOne)
router.post("/", controller.create)
router.put("/:id", controller.update)
router.delete("/:id", controller.remove)
