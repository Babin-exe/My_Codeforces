import { db } from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { eq, or } from "drizzle-orm";
import { signToken } from "../utils/jwt.ts";

export async function registerUser(input: { userName: string, email: string, password: string }) {


    //First lets check if this user is already in the db....

    const existingUser = await db.query.users.findFirst({ where: or(eq(users.userName, input.userName), eq(users.email, input.email)) });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const passwordHash = await Bun.password.hash(input.password);

    const [newUser] = await db.insert(users).values({
        userName: input.userName,
        displayName: input.userName,
        email: input.email,
        passwordHash,
        role: "USER",
    }).returning();


    if (!newUser) throw new Error("Failed to create user");

    const token = signToken({ userId: newUser.id, role: newUser.role });


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


    const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.email != input.email || !await Bun.password.verify(input.password, user.passwordHash)) {
        throw new Error("Invalid credentials");

    }

    const token = signToken({ userId: user.id, role: user.role });

    if (!token) {
        throw new Error("Failed to login");
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
