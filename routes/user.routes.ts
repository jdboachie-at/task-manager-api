import express from "express"
import { listUsers } from "../controllers/user-controller"
import { requireAuth, requirePermission } from "../middleware/auth-middleware"

export const userRoutes = express.Router()

userRoutes.get("/", requireAuth, requirePermission("users:read"), listUsers)
