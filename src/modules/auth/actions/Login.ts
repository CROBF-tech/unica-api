import { findUserByUsername } from "@/db";
import { InvalidCredentials } from "@/modules/auth/errors/InvalidCredentials";
import { compareSync } from "bcrypt";

type Credentials = { username: string; password: string };

export const Login = async (credentials: Credentials) => {

    const user = await findUserByUsername(credentials.username);

    if (!user) throw new InvalidCredentials();

    if (!compareSync(credentials.password, user.password)) throw new InvalidCredentials();

    return user;

}