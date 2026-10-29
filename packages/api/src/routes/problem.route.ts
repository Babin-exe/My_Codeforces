
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.ts";
import { validateBody } from "../middleware/validate.middleware.ts";
import { createProblemSchema } from "../validators/problem.validators.ts";
import { createProblemHandler } from "../controllers/problem.controllers.ts";


export const problemRouter = Router();
problemRouter.post("/create", authenticate, validateBody(createProblemSchema), createProblemHandler);