// server.js
// Entry point aplikasi Minom
//
// Struktur sekarang:
// - Semua halaman (.html) di folder public/ -> disajikan APA ADANYA (statis),
//   nggak ada proses "render" di server. Server cuma ngirim file itu ke browser.
// - Semua data (register, login, obat, jadwal) lewat /api/... yang balikin JSON.
// - JavaScript di masing-masing halaman (public/js/*.js) yang minta data ke /api/...
//   dan nampilinnya ke HTML.

const express = require('express');
const session = require('express-session');
const path = require('path');

const db = require('./db'); // otomatis bikin tabel kalau belum ada

const authApi = require('./routes/api/auth');
const medicinesApi = require('./routes/api/medicines');
const schedulesApi = require('./routes/api/schedules');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// Middleware
// ==========================
app.use(express.json()); // baca body request dalam format JSON (dari fetch di frontend)
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'minom-rahasia-uas-2026', // ganti dengan string acak kalau deploy asli
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
    },
  })
);

// ==========================
// API Routes (semua balikin JSON)
// ==========================
app.use('/api', authApi);
app.use('/api', medicinesApi);
app.use('/api', schedulesApi);

// ==========================
// Static Files (HTML, CSS, JS di folder public/)
// Ini WAJIB ditaro SETELAH /api, biar request ke /api ga ketuker dianggap nyari file statis
// ==========================
app.use(express.static(path.join(__dirname, 'public')));

// ==========================
// Jalankan server
// ==========================
app.listen(PORT, () => {
  console.log(`✅ Minom jalan di http://localhost:${PORT}`);
});
