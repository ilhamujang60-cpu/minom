// routes/api/medicines.js
const express = require('express');
const db = require('../../db');
const router = express.Router();

// POST /api/medicines -> Tambah obat baru
router.post('/medicines', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;

    if (!userId) {
      return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });
    }

    const { nama_obat, dosis, jenis, tanggal_mulai, tanggal_selesai, catatan } = req.body;

    if (!nama_obat) {
      return res.status(400).json({ error: 'Nama obat wajib diisi.' });
    }

    // Simpan ke Supabase PostgreSQL ($1, $2, dst)
    await db.query(
      `INSERT INTO medicines (user_id, nama_obat, dosis, jenis, tanggal_mulai, tanggal_selesai, catatan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        nama_obat,
        dosis || null,
        jenis || 'Obat',
        tanggal_mulai || null,
        tanggal_selesai || null,
        catatan || null
      ]
    );

    return res.json({ success: true, message: 'Obat berhasil disimpan!' });
  } catch (err) {
    console.error('Error saat menambah obat:', err);
    return res.status(500).json({ error: err.message || 'Gagal menyimpan obat pada server.' });
  }
});

// GET /api/medicines -> Ambil daftar obat milik user yang sedang login
router.get('/medicines', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;

    if (!userId) {
      return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });
    }

    const result = await db.query(
      'SELECT * FROM medicines WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('Error saat mengambil daftar obat:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;