import type { AuthUser } from "../middleware/auth.middleware.ts";


/*

This file extends the Express Request type globally.
After the auth middleware runs, req.user is set — but TypeScript 
doesn't know that by default. This declaration merges our AuthUser 
type into Express's Request interface so req.user is properly typed 
everywhere.

*/

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
