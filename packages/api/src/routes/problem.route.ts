import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.ts";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.middleware.ts";
import { createProblemSchema, problemIdParamSchema, problemSlugParamSchema, searchProblemsQuerySchema } from "../validators/problem.validators.ts";
import { createProblemHandler, getProblemByIdHandler, getProblemBySlugHandler, searchProblemsHandler } from "../controllers/problem.controllers.ts";

export const problemRouter = Router();



problemRouter.post("/create", authenticate, validateBody(createProblemSchema), createProblemHandler);
problemRouter.get("/search", validateQuery(searchProblemsQuerySchema), searchProblemsHandler);
problemRouter.get("/id/:id", authenticate, validateParams(problemIdParamSchema), getProblemByIdHandler);
problemRouter.get("/:slug", authenticate, validateParams(problemSlugParamSchema), getProblemBySlugHandler);