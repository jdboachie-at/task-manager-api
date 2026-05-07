import express from "express"
import * as controller from "../controllers/auth-controller"

export const authRoutes = express.Router()

authRoutes.post("/register", controller.register)
authRoutes.post("/login", controller.login)
