import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create PostgreSQL connection pool
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initializeDatabase(): Promise<void> {
  const client = await db.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        code VARCHAR(50) NOT NULL UNIQUE,
        line VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'staff')),
        station_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS manpower (
        id SERIAL PRIMARY KEY,
        station_id INTEGER NOT NULL,
        date DATE NOT NULL,
        shift VARCHAR(20) NOT NULL CHECK(shift IN ('morning', 'afternoon', 'night', 'general')),
        staff_count INTEGER NOT NULL,
        remarks TEXT,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS chemicals (
        id SERIAL PRIMARY KEY,
        station_id INTEGER NOT NULL,
        date DATE NOT NULL,
        chemical_name VARCHAR(100) NOT NULL,
        quantity NUMERIC NOT NULL,
        unit VARCHAR(20) NOT NULL,
        purpose TEXT,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS machinery (
        id SERIAL PRIMARY KEY,
        station_id INTEGER NOT NULL,
        machine_name VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'free' CHECK(status IN ('free', 'occupied', 'maintenance')),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
        FOREIGN KEY (updated_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS waste (
        id SERIAL PRIMARY KEY,
        station_id INTEGER NOT NULL,
        date DATE NOT NULL,
        waste_type VARCHAR(20) NOT NULL CHECK(waste_type IN ('wet', 'dry', 'hazardous')),
        quantity_kg NUMERIC NOT NULL,
        treatment_method VARCHAR(100) NOT NULL,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_manpower_station_date ON manpower(station_id, date);
      CREATE INDEX IF NOT EXISTS idx_chemicals_station_date ON chemicals(station_id, date);
      CREATE INDEX IF NOT EXISTS idx_waste_station_date ON waste(station_id, date);
      CREATE INDEX IF NOT EXISTS idx_machinery_station ON machinery(station_id);
      CREATE INDEX IF NOT EXISTS idx_users_station ON users(station_id);
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default db;
