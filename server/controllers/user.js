import db from "../db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const userController = {
   searchUsersByUsername: async (req, res) => {
      try {
         const { username } = req.query;

         if (!username) {
            return res.status(404).json({ error: "No username given!" });
         }
         // Search users by username (assuming 'username' is the column name in the 'user' table)
         const searchQuery = "SELECT user_id, username, profile_picture_url AS profilePic FROM user WHERE username LIKE ?";
         const [users] = await db.execute(searchQuery, [`%${username}%`]);

         return res.status(200).json({ users });
      } catch (error) {
         console.error("Search users by username error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },

   getAllUsers: async () => {
      try {
         const q = "SELECT * FROM user";
         const [data] = await db.execute(q);

         return res.status(200).json(data);
      } catch (err) {
         console.error("catch: " + err);
         return res.status(500).json({ error: "An error occurred." });
      }
   },
   getUserProfile: async (req, res) => {
      try {
         const { userId } = req.params; // Assuming you have a route parameter for the user's ID

         // Retrieve the user's profile from the database
         const userQuery =
            "SELECT user_id, username, name, profile_picture_url AS profilePic, cover_picture_url as coverPic, bio FROM user WHERE user_id = ?";
         const [user] = await db.execute(userQuery, [userId]);

         if (user.length === 0) {
            return res.status(404).json({ error: "User not found" });
         }

         return res.status(200).json(user[0]);
      } catch (error) {
         console.error("Get user profile error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   deleteUser: async (req, res) => {
      try {
         const userId = req.userId;
         console.log(userId);

         // Delete the user's account from the database
         const deleteQuery = "DELETE FROM user WHERE user_id = ?";
         const [result] = await db.execute(deleteQuery, [userId || null]);

         if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
         }

         return res.status(200).json({ message: "User deleted successfully" });
      } catch (error) {
         console.error("Delete user error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   updateUser: async (req, res) => {
      try {
         const userId = req.params.userId;
         const { username, email, bio, name, profilePic, coverPic } = req.body;

         // Initialize the base query string and parameters for username, email, bio, and name
         let updateQuery = `UPDATE user 
                   SET username = ?, email = ?, bio = ?, name = ?`;
         const queryParams = [username, email, bio, name];

         // Check if profilePic is provided, then add it to the query and parameters
         if (profilePic !== undefined) {
            // Append profile_picture_url to the query and add profilePic to queryParams
            updateQuery += ", profile_picture_url = ?";
            queryParams.push(profilePic);
         }

         // Check if coverPic is provided, then add it to the query and parameters
         if (coverPic !== undefined) {
            // Append cover_picture_url to the query and add coverPic to queryParams
            updateQuery += ", cover_picture_url = ?";
            queryParams.push(coverPic);
         }

         updateQuery += " WHERE user_id = ?";
         queryParams.push(userId);

         const [result] = await db.execute(updateQuery, queryParams);

         if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found or no changes applied" });
         }

         const userQuery =
            "SELECT user_id, username, email, profile_picture_url, cover_picture_url, bio, name FROM user WHERE user_id = ?";
         const [user] = await db.execute(userQuery, [userId]);

         return res.status(200).json(user[0]);
      } catch (error) {
         console.error("Update user error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   changePassword: async (req, res) => {
      try {
         const userId = req.userId;
         const { currentPassword, newPassword } = req.body;

         // Retrieve the user's current password from the database
         const userQuery = "SELECT password_hash FROM user WHERE user_id = ?";
         const [user] = await db.execute(userQuery, [userId]);
         if (user.length === 0) {
            return res.status(404).json({ error: "User not found" });
         }

         const isPasswordCorrect = await bcrypt.compare(currentPassword, user[0].password_hash);

         if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Current password is incorrect" });
         }

         const salt = bcrypt.genSaltSync(10);
         const hashed_new_password = bcrypt.hashSync(newPassword, salt);

         // Update the user's password in the database
         const updateQuery = "UPDATE user SET password_hash = ? WHERE user_id = ?";
         const [result] = await db.execute(updateQuery, [hashed_new_password, userId]);

         if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found or password not updated" });
         }

         return res.status(200).json({ message: "Password changed successfully" });
      } catch (error) {
         console.error("Change password error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
};

export default userController;
