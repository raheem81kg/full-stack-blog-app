import db from "../db.js";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// I set up SLL in redis so the extra "s" in "rediss" is very important.
const redisClient = new Redis(process.env.REDIS_URL);
const postController = {
   addPost: async (req, res) => {
      try {
         const { userId, content, images } = req.body;

         if (userId != req.userId) {
            return res.status(403).json({ error: "Forbidden" });
         }

         const createPostQuery = "INSERT INTO post (user_id, content) VALUES (?, ?)";
         const [result] = await db.execute(createPostQuery, [userId, content]);

         if (images && Array.isArray(images) && images.length > 0) {
            await addImageToPost(result.insertId, images, req.userId);
         }

         return res.status(200).json({ insertId: result.insertId, message: "Post added successfully" });
      } catch (error) {
         console.error("Add post error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   updatePost: async (req, res) => {
      try {
         const { postId, content, userId } = req.body;

         if (userId != req.userId) {
            return res.status(403).json({ error: "Forbidden" });
         }

         const updatePostQuery = "UPDATE post SET content = ? WHERE post_id = ?";
         await db.execute(updatePostQuery, [content, postId]);

         return res.status(200).json({ message: "Post updated successfully" });
      } catch (error) {
         console.error("Update post error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   deletePost: async (req, res) => {
      try {
         const userId = req.userId;
         const { postId } = req.params;

         const getUserQuery = "SELECT user_id FROM post WHERE post_id = ?";
         const [post] = await db.execute(getUserQuery, [postId]);

         if (post.length === 0) {
            return res.status(404).json({ error: "Post not found" });
         }

         if (post[0].user_id != userId) {
            return res.status(403).json({ error: "Forbidden" });
         }

         const deletePostQuery = "DELETE FROM post WHERE post_id = ?";
         await db.execute(deletePostQuery, [postId]);

         return res.status(200).json({ message: "Post deleted successfully" });
      } catch (error) {
         console.error("Delete post error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   getPostById: async (req, res) => {
      try {
         const { postId } = req.params;
         const getPostQuery = "SELECT * FROM post WHERE post_id = ?";
         const [post] = await db.execute(getPostQuery, [postId]);

         if (post.length === 0) {
            return res.status(404).json({ error: "Post not found" });
         }

         const getUsersQuery = `SELECT user_id, name, username, profile_picture_url FROM user WHERE user_id = (${post[0].user_id})`;
         const [user] = await db.execute(getUsersQuery);

         const getImagesQuery = "SELECT * FROM postImage WHERE post_id = ?";
         const [images] = await db.execute(getImagesQuery, [postId]);

         post[0].images = images.map((image) => image.image_url);
         post[0].username = user[0].username;
         post[0].creatorname = user[0].name;
         post[0].user_pfp = user[0].profile_picture_url;

         // Logic to get the count of comments for this post
         const [commentsCountRows] = await db.execute("SELECT COUNT(*) AS commentsCount FROM comment WHERE post_id = ?", [postId]);
         post[0].commentsNum = commentsCountRows[0]?.commentsCount || 0;

         // Logic to get the count of likes for this post
         const [likesCountRows] = await db.execute("SELECT COUNT(*) AS likesCount FROM postLike WHERE post_id = ?", [postId]);
         post[0].likesNum = likesCountRows[0]?.likesCount || 0;

         return res.status(200).json({ post: post[0] });
      } catch (error) {
         console.error("Get post by ID error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   getAllPosts: async (req, res) => {
      try {
         const { offset = 0, limit = 10 } = req.query;

         const cacheKey = `allPosts_${offset}_${limit}`;
         const cachedPosts = await redisClient.get(cacheKey);

         if (cachedPosts) {
            return res.status(200).json({ posts: JSON.parse(cachedPosts) });
         }

         const getAllPostsQuery = `SELECT * FROM post ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
         const [posts] = await db.execute(getAllPostsQuery);

         const userIds = posts.map((post) => post.user_id);
         if (userIds.length < 1) return res.status(404).json({ error: "No posts found" });
         const userIdsString = userIds.join(",");
         const getUsersQuery = `SELECT user_id, name, username, profile_picture_url FROM user WHERE user_id IN (${userIdsString})`;
         const [users] = await db.execute(getUsersQuery);

         const postIds = posts.map((post) => post.post_id);
         const postIdsString = postIds.join(",");
         const getImagesQuery = `SELECT * FROM postImage WHERE post_id IN (${postIdsString})`;
         const [images] = await db.execute(getImagesQuery);

         const postsWithImagesUsersandComments = await Promise.all(
            posts.map(async (post) => {
               const user = users.find((user) => post.user_id === user.user_id);
               post.username = user.username;
               post.creatorname = user.name;
               post.user_pfp = user.profile_picture_url;

               // Logic to get the count of comments for this post
               const [commentsCountRows] = await db.execute("SELECT COUNT(*) AS commentsCount FROM comment WHERE post_id = ?", [
                  post.post_id,
               ]);
               post.commentsNum = commentsCountRows[0]?.commentsCount || 0;

               const matchedImages = images.filter((image) => image.post_id === post.post_id);
               const imageUrls = matchedImages.map((matchedImage) => matchedImage.image_url);

               post.images = imageUrls;
               return post;
            })
         );
         try {
            // Attempt to set the cache in Redis
            await redisClient.setex(cacheKey, 8, JSON.stringify(postsWithImagesUsersandComments));
         } catch (redisError) {
            // Log the Redis error
            console.error("Redis error:", redisError);
            // Continue without failing the entire operation
         }
         return res.status(200).json({ posts: postsWithImagesUsersandComments });
      } catch (error) {
         console.error("Get all posts error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
   getPostsByUser: async (req, res) => {
      try {
         const { targetUserId, offset = 0, limit = 50 } = req.query;
         const cacheKey = `postsByUser_${targetUserId}_${offset}_${limit}`;
         const cachedPosts = await redisClient.get(cacheKey);

         if (cachedPosts) {
            return res.status(200).json({ posts: JSON.parse(cachedPosts) });
         }

         const getPostsQuery = `SELECT * FROM post WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
         const [posts] = await db.execute(getPostsQuery, [targetUserId]);

         const userIds = posts.map((post) => post.user_id);
         if (userIds.length < 1) return res.status(404).json({ error: "No posts found" });
         const userIdsString = userIds.join(",");
         const getUsersQuery = `SELECT user_id, name, username, profile_picture_url FROM user WHERE user_id IN (${userIdsString})`;
         const [users] = await db.execute(getUsersQuery);

         const postIds = posts.map((post) => post.post_id);
         const postIdsString = postIds.join(",");
         const getImagesQuery = `SELECT * FROM postImage WHERE post_id IN (${postIdsString})`;
         const [images] = await db.execute(getImagesQuery);

         const postsWithImagesUsersandComments = await Promise.all(
            posts.map(async (post) => {
               const user = users.find((user) => post.user_id === user.user_id);
               post.username = user.username;
               post.creatorname = user.name;
               post.user_pfp = user.profile_picture_url;

               // Logic to get the count of comments for this post
               const [commentsCountRows] = await db.execute("SELECT COUNT(*) AS commentsCount FROM comment WHERE post_id = ?", [
                  post.post_id,
               ]);
               post.commentsNum = commentsCountRows[0]?.commentsCount || 0;

               const matchedImages = images.filter((image) => image.post_id === post.post_id);
               const imageUrls = matchedImages.map((matchedImage) => matchedImage.image_url);

               post.images = imageUrls;
               return post;
            })
         );
         try {
            // Attempt to set the cache in Redis
            await redisClient.setex(cacheKey, 8, JSON.stringify(postsWithImagesUsersandComments));
         } catch (redisError) {
            // Log the Redis error
            console.error("Redis error:", redisError);
            // Continue without failing the entire operation
         }
         return res.status(200).json({ posts: postsWithImagesUsersandComments });
      } catch (error) {
         console.error("Get posts by user error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },

   getPostsByUserFollows: async (req, res) => {
      try {
         const userId = req.userId;
         const { offset = 0, limit = 10 } = req.query;
         const cacheKey = `postsByFollows_${userId}_${offset}_${limit}`;
         const cachedPosts = await redisClient.get(cacheKey);

         if (cachedPosts) {
            return res.status(200).json({ posts: JSON.parse(cachedPosts) });
         }

         const getFollowedUsersQuery = "SELECT following_id FROM follow WHERE follower_id = ?";
         const [followedUsers] = await db.execute(getFollowedUsersQuery, [userId]);

         const followedUserIds = followedUsers.map((user) => user.following_id);
         // add your own posts to the feed
         followedUserIds.push(userId);

         const getPostsQuery = `SELECT * FROM post WHERE user_id IN (${followedUserIds}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
         const [posts] = await db.execute(getPostsQuery);

         const userIds = posts.map((post) => post.user_id);
         if (userIds.length < 1) return res.status(404).json({ error: "No posts found" });
         const userIdsString = userIds.join(",");
         const getUsersQuery = `SELECT user_id, name, username, profile_picture_url FROM user WHERE user_id IN (${userIdsString})`;
         const [users] = await db.execute(getUsersQuery);

         const postIds = posts.map((post) => post.post_id);
         const postIdsString = postIds.join(",");
         const getImagesQuery = `SELECT * FROM postImage WHERE post_id IN (${postIdsString})`;
         const [images] = await db.execute(getImagesQuery);

         const postsWithImagesUsersandComments = await Promise.all(
            posts.map(async (post) => {
               const user = users.find((user) => post.user_id === user.user_id);
               post.username = user.username;
               post.creatorname = user.name;
               post.user_pfp = user.profile_picture_url;

               // Logic to get the count of comments for this post
               const [commentsCountRows] = await db.execute("SELECT COUNT(*) AS commentsCount FROM comment WHERE post_id = ?", [
                  post.post_id,
               ]);
               post.commentsNum = commentsCountRows[0]?.commentsCount || 0;

               const matchedImages = images.filter((image) => image.post_id === post.post_id);
               const imageUrls = matchedImages.map((matchedImage) => matchedImage.image_url);

               post.images = imageUrls;
               return post;
            })
         );
         try {
            // Attempt to set the cache in Redis
            await redisClient.setex(cacheKey, 8, JSON.stringify(postsWithImagesUsersandComments));
         } catch (redisError) {
            // Log the Redis error
            console.error("Redis error:", redisError);
            // Continue without failing the entire operation
         }
         return res.status(200).json({ posts: postsWithImagesUsersandComments });
      } catch (error) {
         console.error("Get posts by user follows error:", error);
         res.status(500).json({ error: "Internal server error" });
      }
   },
};

const addImageToPost = async (postId, images, userId) => {
   try {
      const getPostQuery = "SELECT user_id FROM post WHERE post_id = ?";
      const [post] = await db.execute(getPostQuery, [postId]);

      if (post.length === 0) {
         throw new Error("Post not found");
      }

      if (post[0].user_id != userId) {
         throw new Error("Forbidden");
      }
      console.log(imageUrl);
      const insertImageQuery = "INSERT INTO postImage (post_id, image_url) VALUES (?, ?)";
      for (const imageUrl of images) {
         await db.execute(insertImageQuery, [postId, imageUrl]);
      }
   } catch (error) {
      console.error("Add image to post error:", error);
   }
};

export default postController;
