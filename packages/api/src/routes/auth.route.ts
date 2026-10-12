import { Router } from "express";
import { registerHandler, loginHandler, logoutHandler, getMe } from "../controllers/auth.controllers.ts";
import { authenticate } from "../middleware/auth.middleware.ts";


export const authRouter = Router();
authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.get("/me", authenticate, getMe);

