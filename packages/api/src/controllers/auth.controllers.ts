import type { Request, Response, NextFunction } from "express";
import { loginUser, registerUser } from "../services/auth.services.ts";

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

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
    try {

        const { email, password } = req.body;
        const result = await loginUser({ email, password });

        return res.cookie("token", result.token, {
            sameSite: "strict",
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        }).json({ success: true, message: "Logged in successfully", data: result.user });


    } catch (error) {
        next(error);
    }
}

