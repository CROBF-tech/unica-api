import type { Request, Response, NextFunction, Handler } from "express";
import { type ZodType, ZodError, type output } from "zod";
import { fromError } from "zod-validation-error";

export function makeController<Body extends ZodType, Params extends ZodType>(controller: (req: { body: output<Body> | undefined, params?: output<Params> | undefined, request: Request }, res: Response) => void, bodySchema?: Body, paramsSchema?: Params): Handler {

    return (req: Request, res: Response, next: NextFunction): void => {

        try {
            const body = bodySchema?.parse(req.body);
            const params = paramsSchema?.parse(req.params);

            controller({ body, params, request: req }, res);

            return;
        } catch (error) {

            if (error instanceof ZodError) {

                const info = fromError(error).details[0]!;

                res.status(400).json({
                    message: info.message,
                    path: info.path[0]
                })

                return;
            }

            next(error);

        }
    }

}