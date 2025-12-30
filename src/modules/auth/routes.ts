import { login } from "@/modules/auth/controllers/login";
import { Router } from "express";

const router: Router = Router();

router.post("/login", login);

export default router;