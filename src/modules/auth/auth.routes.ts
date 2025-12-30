import { Router } from "express";
import { login } from "@/modules/auth/auth.controller";

const router: Router = Router();

router.get("/login", login);

export default router;