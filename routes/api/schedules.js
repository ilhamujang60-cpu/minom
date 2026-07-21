// routes/api/schedules.js
// API buat Tambah & Hapus jadwal jam minum per obat

const express = require('express');
const db = require('../../db');
const { requireLoginApi } = require('../../middleware/auth');

const router = express.Router();

router.use(requireLoginApi);

function getOwnedMedicine(medicineId, userId) {
  return db.prepare('SELECT * FROM medicines WHERE id = ? AND user_id = ?').get(medicineId, userId);
}

// ==========================
// POST /api/medicines/:id/schedules -> tambah jam jadwal
// ==========================
router.post('/medicines/:id/schedules', (req, res) => {
  const medicine = getOwnedMedicine(req.params.id, req.session.userId);
  if (!medicine) return res.status(404).json({ error: 'Obat tidak ditemukan.' });

  const { jam_konsumsi } = req.body;
  if (!jam_konsumsi) {
    return res.status(400).json({ error: 'Jam wajib diisi.' });
  }

  const info = db
    .prepare('INSERT INTO schedules (medicine_id, jam_konsumsi) VALUES (?, ?)')
    .run(medicine.id, jam_konsumsi);

  res.json({ success: true, id: info.lastInsertRowid });
});

// ==========================
// DELETE /api/schedules/:id -> hapus jadwal
// ==========================
router.delete('/schedules/:id', (req, res) => {
  // Pastiin jadwal ini emang punya obat milik user yang login (JOIN)
  const schedule = db
    .prepare(
      `SELECT schedules.* FROM schedules
       JOIN medicines ON medicines.id = schedules.medicine_id
       WHERE schedules.id = ? AND medicines.user_id = ?`
    )
    .get(req.params.id, req.session.userId);

  if (!schedule) return res.status(404).json({ error: 'Jadwal tidak ditemukan.' });

  db.prepare('DELETE FROM schedules WHERE id = ?').run(schedule.id);
  res.json({ success: true });
});

module.exports = router;
