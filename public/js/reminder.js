// public/js/reminder.js
// Reminder sederhana: hitung countdown ke jadwal berikutnya,
// dan kasih notifikasi kalau udah waktunya (selama halaman ini kebuka)

// Minta izin notifikasi browser begitu halaman dibuka (kalau browser mendukung)
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Nyimpen jam mana aja yang UDAH dikasih notifikasi hari ini,
// biar ga muncul berkali-kali tiap detik selama menitnya masih sama
const sudahDiingatkan = new Set();

function formatSisaWaktu(ms) {
  const totalDetik = Math.floor(ms / 1000);
  const jam = Math.floor(totalDetik / 3600);
  const menit = Math.floor((totalDetik % 3600) / 60);
  const detik = totalDetik % 60;

  if (jam > 0) return `${jam}j ${menit}m lagi`;
  if (menit > 0) return `${menit}m ${detik}d lagi`;
  return `${detik} detik lagi`;
}

// Cari jadwal BERIKUTNYA dari daftar jam (format "HH:MM"), relatif ke sekarang
function cariJadwalBerikutnya(times, now) {
  let target = null;

  times.forEach((jamStr) => {
    const [h, m] = jamStr.split(':').map(Number);
    const waktuJadwal = new Date(now);
    waktuJadwal.setHours(h, m, 0, 0);

    // Kalau jadwal hari ini udah lewat, majukan ke besok
    if (waktuJadwal <= now) {
      waktuJadwal.setDate(waktuJadwal.getDate() + 1);
    }

    if (!target || waktuJadwal < target) {
      target = waktuJadwal;
    }
  });

  return target;
}

function tampilkanNotifikasi(namaObat, jam) {
  const pesan = `Waktunya minum ${namaObat} (jadwal jam ${jam})`;

  // Notifikasi asli dari browser (tetap perlu tab ini masih kebuka)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('⏰ Minom - Waktunya Minum!', { body: pesan });
  }

  // Banner cadangan di dalam halaman, buat jaga-jaga kalau user belum izinin notifikasi
  const banner = document.getElementById('reminder-banner');
  if (banner) {
    banner.textContent = `⏰ ${pesan}`;
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 8000);
  }
}

// Batas waktu dianggap "udah deket" -> kartu dikasih highlight (progress indicator)
const BATAS_DUE_SOON_MS = 30 * 60 * 1000; // 30 menit

function cekSemuaJadwal() {
  const now = new Date();
  const jamSekarang = now.toTimeString().slice(0, 5); // format "HH:MM"

  document.querySelectorAll('.medicine-card[data-times]').forEach((card) => {
    const timesAttr = card.getAttribute('data-times');
    const namaObat = card.getAttribute('data-nama');
    if (!timesAttr) return;

    const times = timesAttr.split(',').filter(Boolean);
    if (times.length === 0) return;

    // Cek apakah salah satu jadwal PAS di menit ini
    times.forEach((jamStr) => {
      const key = `${namaObat}-${jamStr}-${now.toDateString()}`;
      if (jamStr === jamSekarang && !sudahDiingatkan.has(key)) {
        sudahDiingatkan.add(key);
        tampilkanNotifikasi(namaObat, jamStr);
      }
    });

    // Update teks countdown ke jadwal berikutnya
    const target = cariJadwalBerikutnya(times, now);
    const countdownEl = card.querySelector('.countdown-text');
    if (countdownEl && target) {
      const sisaMs = target - now;
      countdownEl.textContent = `⏳ ${formatSisaWaktu(sisaMs)}`;

      // Progress indicator: kasih highlight kalau jadwal berikutnya udah deket
      card.classList.toggle('due-soon', sisaMs <= BATAS_DUE_SOON_MS);
    }
  });
}

// Cek tiap detik biar countdown-nya smooth & ga kelewat menit pas notif
setInterval(cekSemuaJadwal, 1000);
cekSemuaJadwal();
