import type { Request, Response, NextFunction, Handler } from "express";
import { type ZodType, ZodError, type output } from "zod";
import { fromError } from "zod-validation-error";
import { ErrorResponse } from "@/shared/errors/ErrorResponse";

// Esta función se usa en casi todos los controladores 👇

export function makeController<Body extends ZodType | undefined = undefined, Params extends ZodType | undefined = undefined>(
    controller: (
        req: {
            body: Body extends ZodType ? output<Body> : undefined,
            params?: Params extends ZodType ? output<Params> : undefined,
            request: Request
        },
        res: Response
    ) => Promise<void>, bodySchema?: Body, paramsSchema?: Params): Handler {

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        try {
            const body = (bodySchema?.parse(req.body) ?? undefined) as Body extends ZodType ? output<Body> : undefined;
            const params = (paramsSchema?.parse(req.params) ?? undefined) as Params extends ZodType ? output<Params> : undefined;

            await controller({ body, params, request: req }, res);
        } catch (error) {

            if (error instanceof ZodError) {

                const info = fromError(error).details[0]!;

                res.status(400).json({
                    message: info.message,
                    path: info.path[0]
                })

                return;
            }

            if (error instanceof ErrorResponse) {

                res.status(error.code).json({
                    message: error.message
                });

            }

            next(error);

        }
    }

}