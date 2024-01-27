import { Router } from "express";
import { authenticateJWT } from "../utils/authenticateJWT.js";
const router = Router();

import followController from "../controllers/follow.js";

router.post("/doesFollow", followController.doesFollow);
router.post("/follow", authenticateJWT, followController.followUser);
router.post("/unfollow", authenticateJWT, followController.unfollowUser);
router.get("/followerCount/:userId", followController.getFollowerCount);
router.get("/followingCount/:userId", followController.getFollowingCount);

export default router;
