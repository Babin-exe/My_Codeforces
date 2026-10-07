import jwt from "jsonwebtoken";

interface jwtPayload {
    userId: string,
    role: string
}



export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) throw new Error("Missing JWT_SECRET_KEY");
    return secret;
}

const JWT_SECRET = getJwtSecret();


export function signToken(payload: jwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): jwtPayload {
    return jwt.verify(token, JWT_SECRET) as unknown as jwtPayload;
}
