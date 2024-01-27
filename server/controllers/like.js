import { db } from "../db.js";

const likeController = {
   getLikesCountByPostId: async (req, res) => {
      try {
         const { postId } = req.query;
         // Execute an SQL query to count the number of likes for a specific post
         const [likesCountRows] = await db.execute("SELECT COUNT(*) AS likesCount FROM postLike WHERE post_id = ?", [postId]);

         // Extract the likes count from the query result
         const likesCount = likesCountRows[0]?.likesCount || 0;

         res.status(200).json({ likesCount });
      } catch (error) {
         console.error("Error fetching likes count:", error);
         res.status(500).json({ message: "Failed to fetch likes count" });
      }
   },
   checkIfLiked: async (req, res) => {
      try {
         const { userId, postId } = req.body;

         // Check if the user has liked the post
         const isLiked = await db.execute("SELECT * FROM postLike WHERE user_id = ? AND post_id = ?", [userId, postId]);
         if (isLiked[0].length > 0) {
            res.status(200).json({ isLiked: true, message: "User has liked this post." });
         } else {
            res.status(200).json({ isLiked: false, message: "User has not liked this post." });
         }
      } catch (error) {
         console.error("Error occurred while checking if liked: ", error);
         res.status(500).json({ message: "Internal server error" });
      }
   },

   likePost: async (req, res) => {
      try {
         const { userId, postId } = req.body;

         // Check if the user has already liked the post
         const isAlreadyLiked = await db.execute("SELECT * FROM postLike WHERE user_id = ? AND post_id = ?", [userId, postId]);

         if (isAlreadyLiked[0].length > 0) {
            return res.status(400).json({ message: "You have already liked this post." });
         }

         // If not already liked, create a new like
         await db.execute("INSERT INTO postLike (user_id, post_id) VALUES (?, ?)", [userId, postId]);

         res.status(200).json({ message: "Successfully liked the post." });
      } catch (error) {
         console.error("Error occurred while liking post: ", error);
         res.status(500).json({ message: "Internal server error" });
      }
   },

   unlikePost: async (req, res) => {
      try {
         const { userId, postId } = req.body;

         // Check if the user has liked the post
         const isLiked = await db.execute("SELECT * FROM postLike WHERE user_id = ? AND post_id = ?", [userId, postId]);

         if (isLiked[0].length === 0) {
            return res.status(400).json({ message: "You have not liked this post." });
         }

         // If liked, remove the like
         await db.execute("DELETE FROM postLike WHERE user_id = ? AND post_id = ?", [userId, postId]);

         res.status(200).json({ message: "Successfully unliked the post." });
      } catch (error) {
         console.error("Error occurred while unliking post: ", error);
         res.status(500).json({ message: "Internal server error" });
      }
   },
};

export default likeController;
