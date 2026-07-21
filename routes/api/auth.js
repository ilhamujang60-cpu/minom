// routes/api/auth.js
// API buat Register, Login, Logout. Semua respon dalam format JSON,
// jadi frontend (JavaScript murni) yang urus tampilan & redirect.

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../db');

const router = express.Router();

// ==========================
// POST /api/register
// ==========================
router.post('/register', async (req, res) => {
  const { nama, email, password, konfirmasi_password } = req.body;

  if (!nama || !email || !password || !konfirmasi_password) {
    return res.status(400).json({ error: 'Semua field wajib diisi.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }
  if (password !== konfirmasi_password) {
    return res.status(400).json({ error: 'Konfirmasi password tidak cocok.' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email sudah terdaftar, silakan login.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    db.prepare('INSERT INTO users (nama, email, password) VALUES (?, ?, ?)').run(
      nama,
      email,
      hashedPassword
    );
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Terjadi kesalahan, coba lagi.' });
  }
});

// ==========================
// POST /api/login
// ==========================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(400).json({ error: 'Email atau password salah.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: 'Email atau password salah.' });
  }

  // Login sukses -> simpen info di session
  req.session.userId = user.id;
  req.session.userNama = user.nama;

  return res.json({ success: true, nama: user.nama });
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
// GET /api/me -> cek status login sekarang (dipakai tiap halaman buat cek "boleh diakses ga")
// ==========================
router.get('/me', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ loggedIn: true, nama: req.session.userNama });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;
