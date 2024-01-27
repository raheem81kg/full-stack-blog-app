import { Router } from "express";
import { authenticateJWT } from "../utils/authenticateJWT.js";
const router = Router();

import postController from "../controllers/post.js";

router.post("/", authenticateJWT, postController.addPost);
router.put("/", authenticateJWT, postController.updatePost);
router.delete("/:postId", authenticateJWT, postController.deletePost);
router.get("/getAllPosts", postController.getAllPosts);
router.get("/getPostsByUser", postController.getPostsByUser);
router.get("/getPostsByUserFollows", authenticateJWT, postController.getPostsByUserFollows);
router.get("/:postId", postController.getPostById);

export default router;
