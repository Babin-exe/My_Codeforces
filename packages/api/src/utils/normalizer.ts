export function normalizeEmail(email: string) {
    if (typeof email !== "string") {
        return null;
    }
    return email.trim().toLowerCase();
}

export function normalizeUserName(userName: string) {
    if (typeof userName !== "string") {
        return null;
    }
    return userName.trim();
}

