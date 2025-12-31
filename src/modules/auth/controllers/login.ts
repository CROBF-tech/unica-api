import { makeController } from "@/shared/utils/makeController";
import { Login } from "@/modules/auth/actions/Login";
import { z } from "zod";

const body = z.object({
    username: z.string("El nombre de usuario es necesario.").nonempty("El nombre de usuario no debe estar vacio.").max(100),
    password: z.string().nonempty().max(100)
});

const params = z.object({}).optional();


export const login = makeController<typeof body, typeof params>(async function ({ body }, res) {

    const { username, password } = body!;

    const user = await Login({ username, password });

    res.json(user);

}, body, params);