// routes/api/medicines.js
const express = require('express');
const db = require('../../db');
const router = express.Router();

// ==========================================
// 1. POST /api/medicines -> Tambah obat baru
// ==========================================
router.post('/medicines', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;
    if (!userId) return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });

    const nama_obat = req.body.nama_obat || req.body.nama;
    const { dosis, jenis, tanggal_mulai, tanggal_selesai, catatan } = req.body;

    if (!nama_obat) {
      return res.status(400).json({ error: 'Nama obat wajib diisi.' });
    }

    await db.query(
      `INSERT INTO medicines (user_id, nama_obat, dosis, jenis, tanggal_mulai, tanggal_selesai, catatan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, nama_obat, dosis || null, jenis || 'Obat', tanggal_mulai || null, tanggal_selesai || null, catatan || null]
    );

    return res.json({ success: true, message: 'Obat berhasil disimpan!' });
  } catch (err) {
    console.error('Error tambah obat:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. GET /api/medicines -> Ambil semua obat milik user
// ==========================================
router.get('/medicines', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;
    if (!userId) return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });

    const medResult = await db.query(
      'SELECT * FROM medicines WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );

    const medicines = await Promise.all(
      medResult.rows.map(async (med) => {
        const schedResult = await db.query(
          'SELECT id, waktu AS jam_konsumsi FROM schedules WHERE medicine_id = $1 ORDER BY waktu ASC',
          [med.id]
        );
        return {
          ...med,
          nama: med.nama_obat || med.nama,
          schedules: schedResult.rows || []
        };
      })
    );

    return res.json(medicines);
  } catch (err) {
    console.error('Error ambil daftar obat:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. GET /api/medicines/:id -> Detail 1 obat + jadwalnya (Dipakai medicine-schedule.js)
// ==========================================
router.get('/medicines/:id', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;
    if (!userId) return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });

    const { id } = req.params;

    const medResult = await db.query(
      'SELECT * FROM medicines WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (medResult.rows.length === 0) {
      return res.status(404).json({ error: 'Obat tidak ditemukan.' });
    }

    const med = medResult.rows[0];

    // Ambil jadwal jam konsumsi (pilih ID dan waktu sebagai jam_konsumsi)
    const schedResult = await db.query(
      'SELECT id, waktu AS jam_konsumsi FROM schedules WHERE medicine_id = $1 ORDER BY waktu ASC',
      [id]
    );

    return res.json({
      ...med,
      nama: med.nama_obat || med.nama,
      schedules: schedResult.rows || []
    });
  } catch (err) {
    console.error('Error detail obat:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. POST /api/medicines/:id/schedules -> Tambah jadwal jam baru
// ==========================================
router.post('/medicines/:id/schedules', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;
    if (!userId) return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });

    const medicineId = req.params.id;
    const { jam_konsumsi } = req.body;

    if (!jam_konsumsi) {
      return res.status(400).json({ error: 'Jam konsumsi wajib diisi.' });
    }

    await db.query(
      'INSERT INTO schedules (user_id, medicine_id, waktu) VALUES ($1, $2, $3)',
      [userId, medicineId, jam_konsumsi]
    );

    return res.json({ success: true, message: 'Jadwal berhasil ditambahkan.' });
  } catch (err) {
    console.error('Error tambah jadwal:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. DELETE /api/schedules/:id -> Hapus 1 jadwal jam
// ==========================================
router.delete('/schedules/:id', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;
    if (!userId) return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });

    const { id } = req.params;

    await db.query(
      'DELETE FROM schedules WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return res.json({ success: true, message: 'Jadwal berhasil dihapus.' });
  } catch (err) {
    console.error('Error hapus jadwal:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. DELETE /api/medicines/:id -> Hapus obat
// ==========================================
router.delete('/medicines/:id', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;
    if (!userId) return res.status(401).json({ error: 'Sesi habis, silakan login ulang.' });

    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM medicines WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Obat tidak ditemukan.' });
    }

    return res.json({ success: true, message: 'Obat berhasil dihapus.' });
  } catch (err) {
    console.error('Error hapus obat:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;