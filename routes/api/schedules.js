// routes/api/schedules.js
// API buat Tambah & Hapus jadwal jam minum per obat (Versi Supabase PostgreSQL)

const express = require('express');
const db = require('../../db');
const { requireLoginApi } = require('../../middleware/auth');

const router = express.Router();

router.use(requireLoginApi);

// Helper function untuk mengecek apakah obat milik user yang login
async function getOwnedMedicine(medicineId, userId) {
  const result = await db.query(
    'SELECT * FROM medicines WHERE id = $1 AND user_id = $2',
    [medicineId, userId]
  );
  return result.rows[0];
}

// ==========================
// POST /api/medicines/:id/schedules -> Tambah jam jadwal
// ==========================
router.post('/medicines/:id/schedules', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;
    const medicine = await getOwnedMedicine(req.params.id, userId);

    if (!medicine) {
      return res.status(404).json({ error: 'Obat tidak ditemukan.' });
    }

    const jam_konsumsi = req.body.jam_konsumsi || req.body.waktu;
    if (!jam_konsumsi) {
      return res.status(400).json({ error: 'Jam wajib diisi.' });
    }

    // Simpan ke Supabase PostgreSQL
    const insertResult = await db.query(
      `INSERT INTO schedules (user_id, medicine_id, waktu) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [userId, medicine.id, jam_konsumsi]
    );

    return res.json({ 
      success: true, 
      id: insertResult.rows[0].id, 
      message: 'Jadwal berhasil ditambahkan.' 
    });
  } catch (err) {
    console.error('Error saat menambah jadwal:', err);
    return res.status(500).json({ error: err.message || 'Gagal menyimpan jadwal.' });
  }
});

// ==========================
// DELETE /api/schedules/:id -> Hapus jadwal
// ==========================
router.delete('/schedules/:id', async (req, res) => {
  try {
    const userId = req.session ? req.session.userId : null;

    // Pastikan jadwal ini terhubung dengan obat milik user yang sedang login
    const scheduleResult = await db.query(
      `SELECT schedules.* FROM schedules
       JOIN medicines ON medicines.id = schedules.medicine_id
       WHERE schedules.id = $1 AND medicines.user_id = $2`,
      [req.params.id, userId]
    );

    if (scheduleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan.' });
    }

    await db.query('DELETE FROM schedules WHERE id = $1', [req.params.id]);

    return res.json({ success: true, message: 'Jadwal berhasil dihapus.' });
  } catch (err) {
    console.error('Error saat menghapus jadwal:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;