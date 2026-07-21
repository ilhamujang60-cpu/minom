// routes/api/medicines.js
const express = require('express');
const db = require('../../db');
const router = express.Router();

// ==========================================
// POST /api/medicines -> Tambah obat baru
// ==========================================
router.post('/medicines', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;

    if (!userId) {
      return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });
    }

    // Mendukung 'nama_obat' maupun 'nama' dari request body
    const nama_obat = req.body.nama_obat || req.body.nama;
    const { dosis, jenis, tanggal_mulai, tanggal_selesai, catatan } = req.body;

    if (!nama_obat) {
      return res.status(400).json({ error: 'Nama obat wajib diisi.' });
    }

    // Simpan ke Supabase PostgreSQL
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

// ==========================================
// GET /api/medicines -> Ambil daftar obat beserta jadwalnya
// ==========================================
router.get('/medicines', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;

    if (!userId) {
      return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });
    }

    // Ambil obat milik user
    const medResult = await db.query(
      'SELECT * FROM medicines WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );

    // Sertakan daftar jadwal jam konsumsi untuk masing-masing obat
    const medicines = await Promise.all(
      medResult.rows.map(async (med) => {
        const schedResult = await db.query(
          'SELECT waktu AS jam_konsumsi FROM schedules WHERE medicine_id = $1 ORDER BY waktu ASC',
          [med.id]
        );

        return {
          ...med,
          nama: med.nama_obat || med.nama, // Alias 'nama' agar dibaca oleh frontend
          schedules: schedResult.rows || [] // Array schedules untuk reminder & dashboard
        };
      })
    );

    return res.json(medicines);
  } catch (err) {
    console.error('Error saat mengambil daftar obat:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DELETE /api/medicines/:id -> Hapus obat berdasarkan ID
// ==========================================
router.delete('/medicines/:id', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;

    if (!userId) {
      return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });
    }

    const { id } = req.params;

    // Hapus obat milik user yang sedang login
    const result = await db.query(
      'DELETE FROM medicines WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Obat tidak ditemukan atau tidak berhak menghapus.' });
    }

    return res.json({ success: true, message: 'Obat berhasil dihapus.' });
  } catch (err) {
    console.error('Error saat menghapus obat:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;