import type { Request, Response, NextFunction } from "express";
import { z } from "zod";


export function validateBody(schema: z.ZodType) {

  return async (req: Request, res: Response, next: NextFunction) => {

    const result = await schema.safeParseAsync(req.body);

    if (!result.success) {

      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }


    req.body = result.data;
    next();
  };

}

export function validateParams(schema: z.ZodType) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const result = await schema.safeParseAsync(req.params);


    if (!result.success) {

      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      res.status(400).json({ success: false, message: "Invalid route parameters", errors })
      return;
    }

    req.params = result.data as Record<string, string>;
    next();
  };
};