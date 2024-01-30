// Import required modules
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

// Function to create tables
export async function createTables() {
   // Your MySQL connection configuration
   let dbConfig;
   let connection;
   if (!process.env.DB_FULL_CONNECTION_STRING) {
      dbConfig = {
         host: process.env.DB_HOST,
         user: process.env.DB_USER,
         password: process.env.DB_PASS,
         database: process.env.DATABASE,
         port: process.env.DB_PORT || 3306,
         waitForConnections: true,
         connectionLimit: 10,
         queueLimit: 0,
      };
   } else {
      dbConfig = process.env.DB_FULL_CONNECTION_STRING;
   }

   try {
      // Create a connection pool
      connection = await mysql.createConnection(dbConfig);
      // Create 'user' table
      await connection.execute(`
      CREATE TABLE IF NOT EXISTS user (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(55) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        profile_picture_url TEXT,
        cover_picture_url TEXT,
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
      // Create 'follow' table
      await connection.execute(`
  CREATE TABLE IF NOT EXISTS follow (
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(follower_id, following_id), 
  FOREIGN KEY (follower_id) REFERENCES user (user_id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES user (user_id) ON DELETE CASCADE
)
`);
      // Create 'post' table
      await connection.execute(`
      CREATE TABLE IF NOT EXISTS post (
        post_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        content VARCHAR(280) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE
      )
    `);

      // Create 'postImage' table
      await connection.execute(`
  CREATE TABLE IF NOT EXISTS postImage (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post (post_id) ON DELETE CASCADE
  )
`);
      // Create 'profilePicture' table
      await connection.execute(`
  CREATE TABLE IF NOT EXISTS profilePicture (
    picture_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    picture_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE
  )
`);
      // Create 'comment' table
      await connection.execute(`
  CREATE TABLE IF NOT EXISTS comment (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    content VARCHAR(280) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (user_id),
    FOREIGN KEY (post_id) REFERENCES post (post_id)
  )
`);
      // Create 'postLike' table
      await connection.execute(`
  CREATE TABLE IF NOT EXISTS postLike (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id),
    FOREIGN KEY (post_id) REFERENCES post (post_id)
  )
`);
      console.log("Tables created successfully.");
   } catch (error) {
      console.error("Error creating tables:", error);
   } finally {
      if (connection) {
         await connection.end();
      }
   }
}
