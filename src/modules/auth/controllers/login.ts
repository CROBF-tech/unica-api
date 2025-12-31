import { env } from "@/config/env";
import { makeController } from "@/shared/utils/makeController";
import { Login } from "@/modules/auth/actions/Login";
import { z } from "zod";
import jwt from "jsonwebtoken";

const body = z.object({
    username: z.string("El nombre de usuario es necesario.").nonempty("El nombre de usuario no debe estar vacio.").max(100),
    password: z.string().nonempty().max(100)
});

export const login = makeController<typeof body>(async function ({ body, request }, res) {

    const { username, password } = body;

    const { password: _, ...user } = await Login({ username, password });

    const token = jwt.sign({ ...user }, env.JWT_SECRET, { expiresIn: "2DAYS" });

    res.status(200).json({
        status: "success",
        messages: "Credenciales correctas.",
        token,
    });

}, body);