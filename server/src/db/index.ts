import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ✅ 환경변수 확인용 로그
console.log("✅ DB 연결 환경변수:");
console.log("HOST:", process.env.DB_HOST);
console.log("PORT:", process.env.DB_PORT);
console.log("USER:", process.env.DB_USER);
console.log("PASS:", process.env.DB_PASS ? "(✅ 존재함)" : "(❌ 없음)");
console.log("DB:", process.env.DB_NAME);

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
