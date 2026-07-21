# Minom — Aplikasi Pengingat & Log Konsumsi Obat/Vitamin

Struktur: **HTML/CSS/JS murni di frontend**, backend Node.js cuma nyediain data lewat **REST API** (format JSON).

## Struktur Project

```
minom-app/
├── server.js               # Entry point: serve file statis + daftarin API
├── db.js                   # Setup database SQLite + bikin tabel
├── package.json
├── middleware/
│   └── auth.js              # Cek status login buat proteksi API
├── routes/api/
│   ├── auth.js               # API: register, login, logout, cek status login
│   ├── medicines.js           # API: CRUD obat/vitamin
│   └── schedules.js           # API: CRUD jadwal jam minum
├── public/                   # SEMUA yang dikirim ke browser ada di sini
│   ├── index.html             # Halaman awal, auto-redirect ke login/dashboard
│   ├── register.html
│   ├── login.html
│   ├── dashboard.html
│   ├── medicine-add.html
│   ├── medicine-schedule.html
│   ├── css/style.css
│   └── js/
│       ├── register.js         # Logic tiap halaman, manggil API pakai fetch()
│       ├── login.js
│       ├── dashboard.js
│       ├── medicine-add.js
│       ├── medicine-schedule.js
│       └── reminder.js          # Countdown & notifikasi jadwal
└── database/
    └── minom.db               # otomatis dibuat saat pertama kali jalan
```

## Konsep Penting: Kenapa Strukturnya Begini?

**Backend (routes/api/...)** cuma jawab pertanyaan lewat JSON — nggak pernah ngirim HTML. Coba buka `http://localhost:3000/api/medicines` di browser (setelah login), bakal keliatan cuma teks JSON polos.

**Frontend (public/...)** adalah HTML biasa yang bisa kamu buka langsung filenya dan baca dari atas ke bawah — nggak ada campuran kode server di dalamnya. Tiap halaman punya file `.js` sendiri yang isinya:
1. Ambil data dari API pakai `fetch()`
2. "Suntik" data itu ke HTML pakai JavaScript (`document.createElement`, `innerHTML`, dll)
3. Kirim data baru ke API kalau ada form yang di-submit

## Cara Menjalankan

**Syarat:** Node.js versi **22.5 atau lebih baru**.

```bash
npm install
npm start
```

Buka `http://localhost:3000` di browser.

## Alur Tiap Halaman

| Halaman | File JS pendamping | Fungsi |
|---|---|---|
| `index.html` | (inline script) | Cek status login, lempar ke login/dashboard |
| `register.html` | `js/register.js` | Kirim data pendaftaran ke `/api/register` |
| `login.html` | `js/login.js` | Kirim data login ke `/api/login` |
| `dashboard.html` | `js/dashboard.js` | Ambil & tampilin daftar obat dari `/api/medicines` |
| `medicine-add.html` | `js/medicine-add.js` | Kirim obat baru ke `/api/medicines` |
| `medicine-schedule.html` | `js/medicine-schedule.js` | Atur jadwal jam via `/api/medicines/:id/schedules` |

## Daftar Endpoint API

```
POST   /api/register              -> daftar akun baru
POST   /api/login                 -> login
POST   /api/logout                -> logout
GET    /api/me                    -> cek status login sekarang

GET    /api/medicines              -> daftar semua obat milik user
GET    /api/medicines/:id           -> detail 1 obat + jadwalnya
POST   /api/medicines               -> tambah obat baru
DELETE /api/medicines/:id            -> hapus obat

POST   /api/medicines/:id/schedules  -> tambah jam jadwal
DELETE /api/schedules/:id             -> hapus jadwal
```

## Skema Database

```
users (id, nama, email, password, created_at)
medicines (id, user_id, nama, dosis, jenis, tanggal_mulai, tanggal_selesai, catatan)
schedules (id, medicine_id, jam_konsumsi)
```

## Catatan Fitur Reminder

Reminder & countdown jalan **selama tab dashboard kebuka** di browser (bukan notifikasi push beneran kayak WhatsApp yang bisa masuk walau app ditutup total). `reminder.js` ngecek tiap detik, bandingin jam sekarang sama jadwal yang tersimpan di setiap kartu obat.
