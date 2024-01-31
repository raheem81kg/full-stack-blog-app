import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { createTables } from "./utils/createTables.js";
dotenv.config({ path: "./.env" });

let dbConfig;

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

const db = mysql.createPool(dbConfig);
createTables();
export default db;
