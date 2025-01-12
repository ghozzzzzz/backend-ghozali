require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDatabase = require('./database/init');

const app = express();

// Init Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));


// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/fire', require('./routes/fire'));
app.use('/api/drought', require('./routes/drought'));

const PORT = process.env.PORT || 5000;

// Inisialisasi database dan jalankan server
const startServer = async () => {
  try {
    // Inisialisasi database
    await initDatabase();

    // Jalankan server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
