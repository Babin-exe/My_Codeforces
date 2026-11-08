import type { Request, Response, NextFunction } from "express";
import { createProblem, getProblem } from "../services/problem.services.ts";
import { AppError } from "../utils/app-error.ts";
import type { CreateProblemInput } from "../validators/problem.validators.ts";



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


    const { slug } = req.params;


    if (!slug || typeof slug !== "string") {
      throw new AppError(400, "No slug provided");
    }

    if (slug.length < 3 || slug.length > 100) {
      throw new AppError(400, "Slug must be between 3 and 100 characters");
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new AppError(400, "Slug must be in kebab-case (e.g. 'two-sum')");
    }


    const result = await getProblem(slug);

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

};