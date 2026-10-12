import { AuthUser } from "../src/middleware/auth.middleware.ts";

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser
        }
    }
}
