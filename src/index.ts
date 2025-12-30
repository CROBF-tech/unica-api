import { initializeDatabase } from "@/config/database";
import App from "@/app";
import { env } from "@/config/env";

initializeDatabase();

const app = new App({
    port: env.PORT,
    routes: [
        {
            path: "/api/users",
            router:
        }
    ]
});

app.listen();