require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await connection.query(
    `INSERT INTO users 
    (organisation_id, name, role, email, password_hash, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [1, "Admin", "ADMIN", "admin@hrms.com", hashedPassword]
  );

  console.log("✅ Admin user created successfully");

  await connection.end();
}

createAdmin().catch(console.error);
