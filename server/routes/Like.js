import { Router } from "express";
import { authenticateJWT } from "../utils/authenticateJWT.js";
const router = Router();

import likeController from "../controllers/like.js";

router.get("/getLikes", likeController.getLikesCountByPostId);
router.post("/checkIfLiked", likeController.checkIfLiked);
router.post("/likePost", authenticateJWT, likeController.likePost);
router.post("/unlikePost", authenticateJWT, likeController.unlikePost);

export default router;
