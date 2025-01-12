const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  try {
    // Buat koneksi awal tanpa database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Buat database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Gunakan database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Buat tabel users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');

    // Buat tabel fire_incidents
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fire_incidents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        province VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        fire_level ENUM('Ringan', 'Sedang', 'Berat') NOT NULL,
        burned_area FLOAT NOT NULL,
        affected_people INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        status ENUM('Aktif', 'Padam') DEFAULT 'Aktif',
        fire_type ENUM('Hutan', 'Pemukiman', 'Industri', 'Lahan') NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Fire incidents table created or already exists');

    // Buat tabel drought_incidents
    await connection.query(`
      CREATE TABLE IF NOT EXISTS drought_incidents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        province VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        drought_level ENUM('Ringan', 'Sedang', 'Berat') NOT NULL,
        affected_area FLOAT NOT NULL,
        affected_people INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        status ENUM('Aktif', 'Selesai') DEFAULT 'Aktif',
        land_type ENUM('Pertanian', 'Perkebunan', 'Pemukiman', 'Hutan') NOT NULL,
        water_source_impact TEXT,
        mitigation_efforts TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Drought incidents table created or already exists');

    // Insert sample data hanya jika dalam mode development
    if (process.env.NODE_ENV !== 'production') {
      // Check if fire_incidents table is empty
      const [existingFireIncidents] = await connection.query('SELECT * FROM fire_incidents LIMIT 1');
      if (existingFireIncidents.length === 0) {
        await connection.query(`
          INSERT INTO fire_incidents
          (province, district, fire_level, burned_area, affected_people, start_date, fire_type, description)
          VALUES
          ('Kalimantan Timur', 'Kutai Kartanegara', 'Berat', 500.5, 1000, '2024-01-01', 'Hutan', 'Kebakaran hutan yang cukup parah'),
          ('Riau', 'Pelalawan', 'Sedang', 300.2, 500, '2024-01-05', 'Lahan', 'Kebakaran lahan gambut'),
          ('Sumatera Selatan', 'Ogan Ilir', 'Ringan', 150.0, 200, '2024-01-10', 'Pemukiman', 'Kebakaran di area pemukiman')
        `);
        console.log('Sample fire incident data inserted');
      }

      // Check if drought_incidents table is empty
      const [existingDroughtIncidents] = await connection.query('SELECT * FROM drought_incidents LIMIT 1');
      if (existingDroughtIncidents.length === 0) {
        await connection.query(`
          INSERT INTO drought_incidents
          (province, district, drought_level, affected_area, affected_people, start_date, land_type, water_source_impact, mitigation_efforts, description)
          VALUES
          ('Jawa Timur', 'Lamongan', 'Berat', 1200.5, 5000, '2024-01-01', 'Pertanian', 'Sumur mengering, sungai surut', 'Distribusi air bersih, pembuatan sumur bor', 'Kekeringan parah di area pertanian'),
          ('Nusa Tenggara Timur', 'Kupang', 'Sedang', 800.2, 3000, '2024-01-05', 'Pemukiman', 'Krisis air bersih', 'Dropping air, pembangunan embung', 'Kekeringan di area pemukiman'),
          ('Jawa Tengah', 'Grobogan', 'Ringan', 500.0, 1500, '2024-01-10', 'Perkebunan', 'Debit air berkurang', 'Pembagian jadwal pengairan', 'Kekeringan ringan area perkebunan')
        `);
        console.log('Sample drought incident data inserted');
      }
    }

    await connection.end();
    console.log('Database initialization completed successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error; // Re-throw error untuk ditangkap di server.js
  }
};

module.exports = initDatabase;
