import { Router } from "express";
import { authenticateJWT } from "../utils/authenticateJWT.js";
const router = Router();

import userController from "../controllers/user.js";

router.get("/", userController.getAllUsers);
router.get("/search", userController.searchUsersByUsername);
router.get("/:userId", userController.getUserProfile);
router.post("/changePassword", authenticateJWT, userController.changePassword);
router.put("/:userId", authenticateJWT, userController.updateUser);
router.delete("/:userId", authenticateJWT, userController.deleteUser);

export default router;
