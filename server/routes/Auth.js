import { Router } from "express";
const router = Router();

import authController from "../controllers/auth.js";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

export default router;
