import { Router } from "express";
import { authenticateJWT } from "../utils/authenticateJWT.js";
const router = Router();

import commentController from "../controllers/comment.js";

router.get("/:postId", commentController.getCommentsForPost);
router.post("/", authenticateJWT, commentController.addComment);
router.delete("/", authenticateJWT, commentController.deleteComment);

export default router;
