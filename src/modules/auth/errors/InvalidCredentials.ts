import { ErrorResponse } from "@/shared/errors/ErrorResponse";

export class InvalidCredentials extends ErrorResponse {

    constructor(data?: string) {
        super("Credenciales invalidas.", 401, data);
    }

}