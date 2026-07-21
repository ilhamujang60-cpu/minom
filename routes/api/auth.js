// routes/api/auth.js
// API buat Register, Login, Logout (Versi Supabase PostgreSQL)

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../db');

const router = express.Router();

// ==========================
// POST /api/register
// ==========================
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password, konfirmasi_password } = req.body;

    // Validasi field utama
    if (!nama || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    // Validasi konfirmasi password (opsional jika dikirim dari frontend)
    if (konfirmasi_password && password !== konfirmasi_password) {
      return res.status(400).json({ error: 'Konfirmasi password tidak cocok.' });
    }

    // Cek apakah email sudah terdaftar di PostgreSQL ($1)
    const existingUserRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserRes.rows.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar, silakan login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke Supabase PostgreSQL
    await db.query(
      'INSERT INTO users (nama, email, password) VALUES ($1, $2, $3)',
      [nama, email, hashedPassword]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('Error pada Register:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server, coba lagi.' });
  }
});

// ==========================
// POST /api/login
// ==========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    // Cari user berdasarkan email di PostgreSQL
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Email atau password salah.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Email atau password salah.' });
    }

    // Simpan info di session
    req.session.userId = user.id;
    req.session.userNama = user.nama;

    return res.json({ success: true, nama: user.nama });
  } catch (err) {
    console.error('Error pada Login:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server, coba lagi.' });
  }
});

// ==========================
// POST /api/logout
// ==========================
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// ==========================
// GET /api/me -> Cek status login
// ==========================
router.get('/me', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ loggedIn: true, nama: req.session.userNama });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;