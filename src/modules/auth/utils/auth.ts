import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export const getRole = (token: string): string | false => {
    try {
        const payload = jwt.verify(token, env.JWT_SECRET, { complete: false });
        if (typeof payload === "string") throw new Error();
        return payload.role;
    } catch (error) {
        return false;
    }
}

export const isCashier = (token: string) => {
    return getRole(token) === "cashier";
}

export const isAdmin = (token: string) => {
    return getRole(token) === "admin";
}

export const hasAnyRole = (token: string) => {
    return !!getRole(token);
}