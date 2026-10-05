import { Router } from "express";
import { registerHandler, loginHandler } from "../controllers/auth.controllers.ts";


export const authRouter = Router();
authRouter.post("/api/auth/register", registerHandler);
authRouter.post("/api/auth/login", loginHandler);

