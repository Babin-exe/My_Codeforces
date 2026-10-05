import type { Request, Response, NextFunction } from "express";
import { registerUser } from "../services/auth.services";

export async function registerHandler(req: Request, res: Response, next: NextFunction) {

    try {
        const { userName, email, password } = req.body;
        
        const result = await registerUser({ userName, email, password });

        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            data: result
        });

    } catch (error) {
        next(error);
    }
};

export const loginHandler = async () => { };

