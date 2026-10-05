import jwt from "jsonwebtoken";

export interface jwtPayload {
    userId: string,
    role: string
}


const JWT_SECRET = process.env.JWT_SECRET_KEY || "default_dev_secret key";

if (!JWT_SECRET) throw new Error("Missing jwt key");


export function signToken(payload: jwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): jwtPayload {
    return jwt.verify(token, JWT_SECRET) as jwtPayload;
}