import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const authController = {
   register: async (req, res) => {
      try {
         const { email, username, password, name } = req.body;

         // CHECK FOR EXISTING USER
         const checkUserQuery = "SELECT * FROM user WHERE email = ? OR username = ?";
         const [existingUsers] = await db.execute(checkUserQuery, [email || null, username || null]);

         if (existingUsers.length > 0) {
            return res.status(409).json("User already exists");
         }

         // Hash the password and create a user
         const salt = bcrypt.genSaltSync(10);
         const hashed_password = bcrypt.hashSync(password, salt);

         const insertUserQuery = "INSERT INTO user (`username`, `email`, `password_hash`, `name`) VALUES (?, ?, ?, ?)";
         await db.execute(insertUserQuery, [username || null, email || null, hashed_password || null, name || null]);

         return res.status(200).json("User has been created.");
      } catch (err) {
         console.error("Register error:", err);
         return res.status(500).json({ error: "An error occurred." });
      }
   },
   login: async (req, res) => {
      try {
         const { usernameOrEmail, password } = req.body;

         const userQuery = "SELECT * FROM user WHERE email = ? OR username = ?";
         const [users] = await db.execute(userQuery, [usernameOrEmail || null, usernameOrEmail || null]); // Ensure that email and username are not undefined

         if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
         }

         const user = users[0];

         const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

         if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Incorrect username or password" });
         }

         const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET);
         const { password_hash, ...userWithoutPassword } = user;

         res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
         })
            .status(200)
            .json(userWithoutPassword);
      } catch (error) {
         console.error("Login error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   logout: async (req, res) => {
      try {
         res.clearCookie("access_token", {
            // Additional cookie options if needed (e.g., sameSite, secure)
            sameSite: "none",
            secure: true,
         })
            .status(200)
            .json("User has been logged out.");
      } catch (error) {
         console.error("Logout error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
};

export default authController;
