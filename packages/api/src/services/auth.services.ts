import { db } from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { eq, or } from "drizzle-orm";
import { signToken } from "../utils/jwt.ts";
import { AppError } from "../utils/app-error.ts";

export async function registerUser(input: { userName: string, email: string, password: string }) {

    if ([input.email, input.password, input.userName].some(i => !i)) {
        throw new AppError(400, "All fields are required");
    }

    if (typeof input.email !== "string" || typeof input.userName !== "string" || typeof input.password !== "string") {
        throw new AppError(400, "Invalid field types");
    }

    const existingUser = await db.query.users.findFirst({ where: or(eq(users.userName, input.userName), eq(users.email, input.email)) });

    if (existingUser) {
        throw new AppError(409, "User already exists");
    }

    const passwordHash = await Bun.password.hash(input.password);

    const [newUser] = await db.insert(users).values({
        userName: input.userName,
        displayName: input.userName,
        email: input.email,
        passwordHash,
        role: "USER",
    }).returning();


    if (!newUser) throw new AppError(500, "Failed to create user");

    const token = signToken({ userId: newUser.id, role: newUser.role });

    if (!token) throw new AppError(500, "Failed to generate token");


    return {
        user: {

            userId: newUser?.id,
            userName: newUser?.userName,
            email: newUser?.email,
            role: newUser?.role
        },
        token
    };

};

export async function loginUser(input: { email: string, password: string }) {


    if ([input.email, input.password].some(i => !i)) {
        throw new AppError(400, "All fields are required");
    }

    if (typeof input.email !== "string" || typeof input.password !== "string") {
        throw new AppError(400, "Invalid field types");
    }

    const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });

    if (!user) {
        throw new AppError(401, "Invalid credentials");
    }

    if (user.email != input.email || !await Bun.password.verify(input.password, user.passwordHash)) {
        throw new AppError(401, "Invalid credentials");

    }

    const token = signToken({ userId: user.id, role: user.role });

    if (!token) {
        throw new AppError(500, "Failed to generate token");
    }


    const result = {
        user: {
            userId: user.id,
            userName: user.userName,
            email: user.email,
            role: user.role
        },
        token
    };

    return result;

}
