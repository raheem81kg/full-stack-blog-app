import mysql from "mysql2/promise"; // Import 'mysql2/promise' for async/await support
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export const db = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASS,
   database: process.env.DATABASE,
});

console.log("Connected to the database!");
