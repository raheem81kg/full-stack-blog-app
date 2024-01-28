import db from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

// Used to protect routes
export const authenticateJWT = async (req, res, next) => {
   const token = req.cookies.access_token;

   if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err || !decoded || !decoded.id) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = decoded;

      const findUserQuery = "SELECT * FROM user WHERE user_id = ?";
      const [user] = await db.execute(findUserQuery, [id]);

      if (user.length === 0) {
         return res.status(401).json({ error: "Unauthorized" });
      }

      // Store user information in the request object for use in route handlers
      req.userId = id;
      next();
   });
};
