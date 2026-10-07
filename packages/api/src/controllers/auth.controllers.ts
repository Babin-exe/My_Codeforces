import type { Request, Response, NextFunction } from "express";
import { loginUser, registerUser } from "../services/auth.services.ts";
import { AppError } from "../utils/app-error.ts";
import { normalizeUserName, normalizeEmail } from "../utils/normalizer.ts";


export function emailChecker(email: string): boolean {

    const EMAIL_REGEX =
        /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
    if (email.length === 0 || email.length > 254) return false;
    return EMAIL_REGEX.test(email);

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
    return /^[a-z][a-z0-9_]{4,29}$/.test(userName);

}



export function userInputValidator(input: { userName: string, email: string, password: string }) {



    const userName = normalizeUserName(input.userName);
    const email = normalizeEmail(input.email);
    const password = input.password;


    if (!userName || !email || !password) {
        throw new AppError(400, "All fields are required");
    }

    if (!userNameChecker(userName)) {
        throw new AppError(400, "Invalid userName format or length");
    }

    if (!emailChecker(email)) {
        throw new AppError(400, "Invalid email format");
    }

    if (!passwordChecker(password)) {
        throw new AppError(400, "Invalid password length or format");
    }


    return { userName, email, password };
}


export async function registerHandler(req: Request, res: Response, next: NextFunction) {

    try {


        if (!req.body || typeof req.body !== "object") {
            throw new AppError(400, "Invalid request body");
        }

        const { userName, email, password } = req.body;


        if (typeof userName !== "string" || typeof email !== "string" || typeof password !== "string") {
            throw new AppError(400, "Invalid field types");
        }

        const validatedInfo = userInputValidator({ userName, email, password });

        const result = await registerUser(validatedInfo);

        if (!result.token) throw new AppError(500, "Failed to generate token");

        return res.status(201).cookie("token", result.token, {
            sameSite: "strict",
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
        }).json({
            success: true,
            message: "User Registered Successfully",
            data: result.user
        });



    } catch (error) {
        next(error);
    }
};

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
    try {


        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            throw new AppError(400, "Invalid request body");
        }

        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string") {
            throw new AppError(400, "Invalid field types");
        }

        const normalizedEmail = normalizeEmail(email);

        if (normalizedEmail === null) throw new AppError(400, "Invalid email");

        const result = await loginUser({ email: normalizedEmail, password });

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

