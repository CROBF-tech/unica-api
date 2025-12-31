import { type Request } from "express";
import jwt from "jsonwebtoken";

export const hasToken = (req: Request, role: string) => {

    const h = req.headers.authorization;

}