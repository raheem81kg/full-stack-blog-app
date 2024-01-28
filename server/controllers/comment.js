import db from "../db.js";

const commentController = {
   addComment: async (req, res) => {
      try {
         const { userId, postId, content } = req.body;

         const createCommentQuery = "INSERT INTO comment (user_id, post_id, content) VALUES (?, ?, ?)";
         await db.execute(createCommentQuery, [userId, postId, content]);

         return res.status(200).json({ message: "Comment added successfully" });
      } catch (error) {
         console.error("Add comment error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   deleteComment: async (req, res) => {
      try {
         const { commentId, userId } = req.body;

         if (userId !== req.userId) {
            return res.status(403).json({ error: "Forbidden" });
         }

         const deleteCommentQuery = "DELETE FROM comment WHERE comment_id = ? AND user_id = ?";
         await db.execute(deleteCommentQuery, [commentId, userId]);

         return res.status(200).json({ message: "Comment deleted successfully" });
      } catch (error) {
         console.error("Delete comment error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   getCommentsForPost: async (req, res) => {
      try {
         const { postId } = req.params;
         // Fetch comments for a specific post
         const getCommentsQuery = "SELECT * FROM comment WHERE post_id = ? ORDER BY created_at DESC";
         const [comments] = await db.execute(getCommentsQuery, [postId]);

         if (comments.length === 0) {
            return res.status(404).json({ message: "No comments found for the specified post" });
         }

         // Extract user IDs from comments
         const userIds = comments.map((comment) => comment.user_id);
         const uniqueUserIds = Array.from(new Set(userIds)); // Ensure unique user IDs

         // Retrieve user details for each commenter
         const getUsersQuery = `SELECT user_id, name, username, profile_picture_url FROM user WHERE user_id IN (${uniqueUserIds.join(
            ","
         )})`;
         const [users] = await db.execute(getUsersQuery);

         // Map user details to comments
         const commentsWithUserDetails = comments.map((comment) => {
            const user = users.find((user) => user.user_id === comment.user_id);
            return {
               ...comment,
               commenter: {
                  user_id: user.user_id,
                  name: user.name,
                  username: user.username,
                  user_pfp: user.profile_picture_url,
               },
            };
         });

         return res.status(200).json({ comments: commentsWithUserDetails });
      } catch (error) {
         console.error("Get comments for post error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
};

export default commentController;
