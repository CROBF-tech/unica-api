import { makeController } from "@/shared/utils/makeController";
import { z } from "zod";

const body = z.object({
    username: z.string("El nombre de usuario es necesario.").nonempty("El nombre de usuario no debe estar vacio.").max(100),
    password: z.string().nonempty().max(100)
});

const params = z.object({}).optional();


export const login = makeController<typeof body, typeof params>(function ({ body }, res) {

    res.json(body);

}, body, params);