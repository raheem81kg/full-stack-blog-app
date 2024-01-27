import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, "../client/public/upload");
   },
   filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
   },
});

const upload = multer({ storage });

const app = express();
dotenv.config({ path: "./.env" });

// parse JSON in requests
app.use(express.json()).use(cookieParser());
// Configure CORS to allow requests from any origin
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// ROUTES
import userRoute from "./routes/User.js";
import authRoute from "./routes/Auth.js";
import postRoute from "./routes/Post.js";
import commentRoute from "./routes/Comment.js";
import followRoute from "./routes/Follow.js";
import likeRoute from "./routes/Like.js";
import uploadRoute from "./routes/Upload.js";

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);
app.use("/api/comment", commentRoute);
app.use("/api/follow", followRoute);
app.use("/api/like", likeRoute);
app.use("/api/upload", uploadRoute);

const PORT = process.env.SERVER_PORT || 4999;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));

export default app;
