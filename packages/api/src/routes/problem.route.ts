import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.ts";
import { validateBody } from "../middleware/validate.middleware.ts";
import { createProblemSchema } from "../validators/problem.validators.ts";
import { createProblemHandler, getProblemByIdHandler, getProblemBySlugHandler, searchProblemsHandler } from "../controllers/problem.controllers.ts";


export const problemRouter = Router();

problemRouter.post("/create", authenticate,
    validateBody(createProblemSchema), createProblemHandler);



problemRouter.get("/search", searchProblemsHandler);

problemRouter.get("/id/:id", getProblemByIdHandler);

problemRouter.get("/:slug", getProblemBySlugHandler);



