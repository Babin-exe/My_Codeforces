import type { Request, Response, NextFunction } from "express";
import { createProblem, getProblemById, getProblemBySlug } from "../services/problem.services.ts";
import { AppError } from "../utils/app-error.ts";
import type { CreateProblemInput, ProblemIdParamSchema, ProblemSlugParamSchema } from "../validators/problem.validators.ts";



export async function createProblemHandler(req: Request, res: Response, next: NextFunction) {
  try {

    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }


    const input = req.body as CreateProblemInput;
    const userId = req.user.id;
    const result = await createProblem(input, userId);

    return res.status(201).json({
      success: true,
      message: "Problem created successfully",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};


export async function getProblemBySlugHandler(req: Request, res: Response, next: NextFunction) {

  try {

    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const { slug } = req.params as ProblemSlugParamSchema;

    const result = await getProblemBySlug(slug);

    return res.status(200).json({
      success: true,
      message: "Successfully retrieved problem",
      data: result
    });
  }
  catch (error) {
    next(error);
  }

};

export async function searchProblemsHandler(req: Request, res: Response, next: NextFunction) {

  
};


export async function getProblemByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {


    if (!req.user) {
      throw new AppError(401, "Not Authenticated");
    }

    const { id } = req.params as ProblemIdParamSchema;


    const result = await getProblemById(id);

    return res.status(200).json({ success: true, message: "Successfully retrived problem", data: result })

  } catch (error) {
    next(error);
  }

}; 