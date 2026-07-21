// db.js
// Setup koneksi database SQLite pakai modul bawaan Node.js (node:sqlite)
// Catatan: butuh Node.js versi 22.5+ (masih berstatus experimental, tapi stabil dipakai)

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'minom.db');
const db = new DatabaseSync(dbPath);

// Aktifkan foreign key constraint (SQLite defaultnya mati)
db.exec('PRAGMA foreign_keys = ON');

// ==========================
// TABEL: users
// ==========================
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ==========================
// TABEL: medicines (obat/vitamin milik user)
// ==========================
db.exec(`
  CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nama TEXT NOT NULL,
    dosis TEXT,
    jenis TEXT CHECK(jenis IN ('obat', 'vitamin', 'suplemen')) DEFAULT 'obat',
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    catatan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// ==========================
// TABEL: schedules (jadwal minum per obat)
// ==========================
db.exec(`
  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id INTEGER NOT NULL,
    jam_konsumsi TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
  )
`);

// ==========================
// TABEL: logs (riwayat konsumsi)
// ==========================
db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    jam_aktual TEXT,
    status TEXT CHECK(status IN ('diminum', 'telat', 'skip')) DEFAULT 'diminum',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
  )
`);

module.exports = db;
