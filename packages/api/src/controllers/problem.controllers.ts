import type { Request, Response, NextFunction } from "express";
import { createProblem } from "../services/problem.services.ts";
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
}


export async function getProblemHandler(req: Request, res: Response, next: NextFunction) {

}