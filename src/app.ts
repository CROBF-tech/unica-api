import express, {
    type Application,
    type Router,
    type Request,
    type Response,
    type NextFunction,
    type ErrorRequestHandler,
} from "express";
import cors from "cors";
import type { HelmetOptions } from "helmet";
import helmet from "helmet";
import compression from "compression";

interface RouteConfig {
    path: string;
    router: Router;
}

interface ExpressAppOptions {
    port?: number;
    middlewares?: Array<
        (req: Request, res: Response, next: NextFunction) => void
    >;
    routes?: RouteConfig[];
    errorHandlers?: ErrorRequestHandler[];
    cors?: boolean;
    corsOptions?: cors.CorsOptions;
    helmet?: boolean;
    helmetOptions?: HelmetOptions;
    logger?: boolean;
    loggerFormat?: string;
    compression?: boolean;
    compressionOptions?: compression.CompressionOptions;
}

export default class ExpressApp {
    private app: Application;
    private port: number;
    private middlewares: Array<
        (req: Request, res: Response, next: NextFunction) => void
    >;
    private routes: RouteConfig[];
    private errorHandlers: ErrorRequestHandler[];

    constructor(options: ExpressAppOptions = {}) {
        this.app = express();
        this.port = options.port ?? 3000;
        this.middlewares = options.middlewares || [];
        this.routes = options.routes || [];
        this.errorHandlers = options.errorHandlers || [];

        // Configuración predeterminada
        this.setupDefaultMiddlewares(options);

        // Aplica middlewares personalizados
        this.setupCustomMiddlewares();

        // Aplica rutas
        this.setupRoutes();
    }

    private setupDefaultMiddlewares(options: ExpressAppOptions = {}): void {
        // Analizar solicitudes JSON
        this.app.use(express.json());

        // Analizar cuerpos de solicitud URL-encoded
        this.app.use(express.urlencoded({ extended: true }));

        // Habilitar CORS
        if (options.cors !== false) {
            this.app.use(cors(options.corsOptions || {}));
        }

        // Seguridad con Helmet
        if (options.helmet !== false) {
            this.app.use(helmet(options.helmetOptions || {}));
        }

        // Compresión de respuestas
        if (options.compression !== false) {
            this.app.use(compression(options.compressionOptions || {}));
        }
    }

    private setupCustomMiddlewares(): void {
        this.middlewares.forEach((middleware) => {
            this.app.use(middleware);
        });
    }

    private setupRoutes(): void {
        this.routes.forEach((route) => {
            const { path, router } = route;
            this.app.use(path, router);
        });
    }

    // Métodos para agregar middlewares, rutas y manejadores de errores después de la inicialización
    public addMiddleware(
        middleware: (req: Request, res: Response, next: NextFunction) => void
    ): this {
        this.app.use(middleware);
        return this;
    }

    public addRoute(path: string, router: Router): this {
        this.app.use(path, router);
        return this;
    }

    public addErrorHandler(handler: ErrorRequestHandler): this {
        this.app.use(handler);
        return this;
    }

    // Iniciar el servidor
    public listen(callback?: () => void): ReturnType<Application["listen"]> {
        return this.app.listen(this.port, () => {
            console.log(`Servidor ejecutándose en el puerto ${this.port}`);
            if (callback) callback();
        });
    }

    // Acceder a la instancia de Express
    public getApp(): Application {
        return this.app;
    }
}