// routes.js
import { Router } from "express";
import { upload } from "../utils/upload.js";
const router = Router();

import uploadController from "../controllers/upload.js";

router.post("/uploadPostImages", upload.array("images"), uploadController.uploadPostImages);
router.post("/uploadProfilePic", upload.single("file"), uploadController.uploadProfilePic);
router.post("/uploadCoverPic", upload.single("file"), uploadController.uploadCoverPic);

export default router;
