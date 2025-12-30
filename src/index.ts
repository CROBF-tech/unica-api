import { initializeDatabase } from "@/config/database";
import App from "@/app";
import { env } from "@/config/env";
import { z as zod } from 'zod';
import { createErrorMap } from 'zod-validation-error';


// ===================================================
import authRouter from "@/modules/auth/routes";
// ===================================================

initializeDatabase();
zod.config({
    customError: createErrorMap(),
});

const app = new App({
    port: env.PORT,
    routes: [
        {
            path: "/api/auth",
            router: authRouter
        }
    ]
});

app.listen();