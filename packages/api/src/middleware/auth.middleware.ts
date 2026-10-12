import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { verifyToken } from "../utils/jwt";
import { db } from "../db/connection";



export interface AuthUser {
    id: string,
    userName: string,
    role: "USER" | "ADMIN",
    email: string
}



export async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {

        const token = req.cookies?.token;
        if (!token) { throw new AppError(401, "Not authenticated"); }

        let payload;
        try {
            payload = verifyToken(token);
            if (!payload.id) { throw new AppError(401, "Not authenticated"); }
        }
        catch { throw new AppError(401, "Invalid or expired"); }




        const user = await db.query.users.findFirst({

            where: (users, { eq }) => eq(users.id, payload.id),
            columns: {
                id: true,
                email: true,
                role: true,
                userName: true
            }

        });

        if (!user) {
            throw new AppError(401, "Not authenticated");
        }


        req.user = user;
        next();
    } catch (error) {
        next(error);
    }

}


