// routes/api/medicines.js
// API buat Tambah, Lihat, Hapus obat/vitamin milik user yang login

const express = require('express');
const db = require('../../db');
const { requireLoginApi } = require('../../middleware/auth');

const router = express.Router();

router.use(requireLoginApi);

// ==========================
// GET /api/medicines -> daftar obat milik user, sekalian jadwalnya
// ==========================
router.get('/medicines', (req, res) => {
  const medicines = db
    .prepare('SELECT * FROM medicines WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.session.userId);

  const result = medicines.map((med) => {
    const schedules = db
      .prepare('SELECT * FROM schedules WHERE medicine_id = ? ORDER BY jam_konsumsi ASC')
      .all(med.id);
    return { ...med, schedules };
  });

  res.json(result);
});

// ==========================
// GET /api/medicines/:id -> detail 1 obat (dipakai di halaman atur jadwal)
// ==========================
router.get('/medicines/:id', (req, res) => {
  const medicine = db
    .prepare('SELECT * FROM medicines WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);

  if (!medicine) return res.status(404).json({ error: 'Obat tidak ditemukan.' });

  const schedules = db
    .prepare('SELECT * FROM schedules WHERE medicine_id = ? ORDER BY jam_konsumsi ASC')
    .all(medicine.id);

  res.json({ ...medicine, schedules });
});

// ==========================
// POST /api/medicines -> tambah obat baru
// ==========================
router.post('/medicines', (req, res) => {
  const { nama, dosis, jenis, tanggal_mulai, tanggal_selesai, catatan } = req.body;

  if (!nama || !jenis) {
    return res.status(400).json({ error: 'Nama dan jenis wajib diisi.' });
  }

  const info = db
    .prepare(
      `INSERT INTO medicines (user_id, nama, dosis, jenis, tanggal_mulai, tanggal_selesai, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.session.userId,
      nama,
      dosis || null,
      jenis,
      tanggal_mulai || null,
      tanggal_selesai || null,
      catatan || null
    );

  res.json({ success: true, id: info.lastInsertRowid });
});

// ==========================
// DELETE /api/medicines/:id -> hapus obat
// ==========================
router.delete('/medicines/:id', (req, res) => {
  db.prepare('DELETE FROM medicines WHERE id = ? AND user_id = ?').run(
    req.params.id,
    req.session.userId
  );
  res.json({ success: true });
});

module.exports = router;
