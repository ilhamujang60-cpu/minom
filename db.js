const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000 // Batas waktu koneksi 5 detik
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};