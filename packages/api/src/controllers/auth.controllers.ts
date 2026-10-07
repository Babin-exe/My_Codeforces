import type { Request, Response, NextFunction } from "express";
import { loginUser, registerUser } from "../services/auth.services.ts";
import { AppError } from "../utils/app-error.ts";


export function emailChecker(email: string): boolean {

    const EMAIL_REGEX =
        /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

    const normalized = email.trim().toLowerCase();
    if (normalized.length === 0 || normalized.length > 254) return false;

    return EMAIL_REGEX.test(normalized);

}


export function passwordChecker(password: string): boolean {

    if (password.length < 10 || password.length > 30) return false;

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasDigit = /[0-9]/.test(password);

    return (hasLowerCase && hasUpperCase && hasSpecialChar && hasDigit);
}

export function userNameChecker(userName: string): boolean {
    const normalized = userName.trim();
    return /^[a-z][a-z0-9_]{4,29}$/.test(normalized);

}



export function userInputValidator(input: { userName: string, email: string, password: string }): void {

    if (!input.userName || !input.email || !input.password) {
        throw new AppError(400, "All fields are required");
    }

    if (!userNameChecker(input.userName)) {
        throw new AppError(400, "Invalid userName format or length");
    }

    if (!emailChecker(input.email)) {
        throw new AppError(400, "Invalid email format");
    }

    if (!passwordChecker(input.password)) {
        throw new AppError(400, "Invalid password length or format");
    }



}


export async function registerHandler(req: Request, res: Response, next: NextFunction) {

    try {
        const { userName, email, password } = req.body;
        userInputValidator({ userName, email, password });
        let result = await registerUser({ userName, email, password });
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
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        }).json({ success: true, message: "Logged in successfully", data: result.user });


    } catch (error) {
        next(error);
    }
}

