const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  const rootConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    // Create database if not exists
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`Database ${process.env.DB_NAME} ensured`);

    // Connect with database selected
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true // Allow multiple statements
    });

    // Drop existing tables to ensure clean schema
    await connection.query(`
      DROP TABLE IF EXISTS ratings;
      DROP TABLE IF EXISTS stores;
      DROP TABLE IF EXISTS users;
    `);

    // Create Users table
    await connection.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role ENUM('admin', 'user', 'store_owner') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create Stores table
    await connection.query(`
      CREATE TABLE stores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create Ratings table
    await connection.query(`
      CREATE TABLE ratings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store (user_id, store_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await connection.query(`
      INSERT INTO users (name, email, password, address, role) 
      VALUES ('System Administrator', 'admin@system.com', ?, 'System Address', 'admin')
    `, [hashedPassword]);

    // Add some test stores
    await connection.query(`
      INSERT INTO stores (name, email, address) VALUES 
      ('Store 1', 'store1@test.com', '123 Test St'),
      ('Store 2', 'store2@test.com', '456 Sample Ave'),
      ('Store 3', 'store3@test.com', '789 Demo Rd')
    `);

    console.log('Database schema created successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw error;
  } finally {
    await rootConnection.end();
  }
}

// Run migration
createDatabase().catch(console.error);