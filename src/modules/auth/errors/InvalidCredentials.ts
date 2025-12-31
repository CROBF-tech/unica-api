import { ErrorResponse } from "@/shared/errors/ErrorResponse";
import status from "http-status";

export class InvalidCredentials extends ErrorResponse {

    constructor(data?: string) {
        super("Credenciales invalidas.", status.UNAUTHORIZED, data);
    }

}