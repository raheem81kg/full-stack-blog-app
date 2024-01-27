import { db } from "../db.js";

const followController = {
   doesFollow: async (req, res) => {
      try {
         const { followerId, followingId } = req.body;

         // Check if the user is already followed using a parameterized query
         const isAlreadyFollowed = await db.execute("SELECT * FROM follow WHERE follower_id = ? AND following_id = ?", [
            followerId,
            followingId,
         ]);

         // If the length of the result is greater than 0, the user is already following
         const isFollowing = isAlreadyFollowed[0].length > 0;

         return res.status(200).json({ isFollowing });
      } catch (error) {
         res.status(500).json({ message: "Internal server error" });
      }
   },

   followUser: async (req, res) => {
      try {
         const { followerId, followingId } = req.body;

         if (followerId != req.userId) {
            return res.status(403).json({ error: "Forbidden" });
         }
         // Check if the user is already followed
         const isAlreadyFollowed = await db.execute("SELECT * FROM follow WHERE follower_id = ? AND following_id = ?", [
            followerId,
            followingId,
         ]);

         if (isAlreadyFollowed[0].length > 0) {
            return res.status(400).json({ message: "You are already following this user." });
         }

         // If not already followed, create a new follow relationship
         await db.execute("INSERT INTO follow (follower_id, following_id) VALUES (?, ?)", [followerId, followingId]);

         res.status(200).json({ message: "Successfully followed the user." });
      } catch (error) {
         console.error("Error occurred while following user: ", error);
         res.status(500).json({ message: "Internal server error" });
      }
   },

   unfollowUser: async (req, res) => {
      try {
         const { followerId, followedUserId } = req.body;

         if (followerId != req.userId) {
            return res.status(403).json({ error: "Forbidden" });
         }
         // Check if the user is followed
         const isFollowed = await db.execute("SELECT * FROM follow WHERE follower_id = ? AND following_id = ?", [
            followerId,
            followedUserId,
         ]);

         if (isFollowed[0].length === 0) {
            return res.status(400).json({ message: "You are not following this user." });
         }

         // If followed, remove the follow relationship
         await db.execute("DELETE FROM follow WHERE follower_id = ? AND following_id = ?", [followerId, followedUserId]);

         res.status(200).json({ message: "Successfully unfollowed the user." });
      } catch (error) {
         console.error("Error occurred while unfollowing user: ", error);
         res.status(500).json({ message: "Internal server error" });
      }
   },
   getFollowerCount: async (req, res) => {
      try {
         const { userId } = req.params;

         const countFollowersQuery = "SELECT COUNT(*) AS followerCount FROM follow WHERE following_id = ?";
         const [result] = await db.execute(countFollowersQuery, [userId]);

         return res.status(200).json({ followerCount: result[0].followerCount });
      } catch (error) {
         console.error("Get follower count error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   getFollowingCount: async (req, res) => {
      try {
         const { userId } = req.params;

         const countFollowingQuery = "SELECT COUNT(*) AS followingCount FROM follow WHERE follower_id = ?";
         const [result] = await db.execute(countFollowingQuery, [userId]);

         return res.status(200).json({ followingCount: result[0].followingCount });
      } catch (error) {
         console.error("Get following count error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
};

export default followController;
