import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.ts";

type ParseError = Error & {
    type?: string | null,
    statusCode?: number | null,
    status?: number | null
}

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
    }


    const parsed = error as ParseError;

    if (parsed.type === "entity.parse.failed") {
        return res.status(400).json({ success: false, message: "Invalid JSON body" });
    }



    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });

}