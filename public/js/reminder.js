// public/js/reminder.js

function hitungMundurJadwal() {
  const cards = document.querySelectorAll('.medicine-card');
  const now = new Date();
  let perluRefresh = false;

  cards.forEach((card) => {
    const timesAttr = card.getAttribute('data-times');
    const tglSelesaiAttr = card.getAttribute('data-selesai');
    const countdownEl = card.querySelector('.countdown-text');

    if (!countdownEl) return;

    if (!timesAttr || timesAttr.trim() === '') {
      countdownEl.textContent = 'Belum ada jadwal jam.';
      return;
    }

    const times = timesAttr.split(',').map((t) => t.trim()).filter(Boolean);
    if (times.length === 0) return;

    let minDiff = Infinity;
    let nextTarget = null;

    times.forEach((t) => {
      const parts = t.split(':');
      if (parts.length < 2) return;

      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);

      // 1. Cek Waktu Hari Ini
      const targetToday = new Date(now);
      targetToday.setHours(hours, minutes, 0, 0);

      if (targetToday > now) {
        // Masih ada jam konsumsi hari ini
        const diff = targetToday - now;
        if (diff < minDiff) {
          minDiff = diff;
          nextTarget = targetToday;
        }
      } else {
        // 2. Jam hari ini sudah lewat -> Cek apakah besok masih dalam masa tanggal_selesai
        const targetTomorrow = new Date(now);
        targetTomorrow.setDate(targetTomorrow.getDate() + 1);
        targetTomorrow.setHours(hours, minutes, 0, 0);

        const besokStr = targetTomorrow.toISOString().slice(0, 10);
        const cleanSelesai = tglSelesaiAttr ? tglSelesaiAttr.split('T')[0] : null;

        // Jika konsumsi rutin (tanpa batas) ATAU besok masih <= tanggal_selesai -> Reset ke jam besok!
        if (!cleanSelesai || besokStr <= cleanSelesai) {
          const diff = targetTomorrow - now;
          if (diff < minDiff) {
            minDiff = diff;
            nextTarget = targetTomorrow;
          }
        }
      }
    });

    // Jika tidak ada target tersisa (jam & tanggal hari ini sudah resmi selesai)
    if (!nextTarget) {
      perluRefresh = true;
      return;
    }

    // Format dan Tampilkan Waktu
    const totalSeconds = Math.floor(minDiff / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      countdownEl.innerHTML = `⏳ <strong>${hrs}j ${mins}m lagi</strong>`;
    } else if (mins > 0) {
      countdownEl.innerHTML = `⏳ <strong>${mins}m ${secs}d lagi</strong>`;
    } else {
      countdownEl.innerHTML = `🚨 <strong>${secs}d lagi!</strong>`;
    }
  });

  // Jika ada obat yang periodenya selesai, hapus dari Dashboard & refresh tampilan
  if (perluRefresh && typeof window.muatDataObat === 'function') {
    window.muatDataObat();
  }
}

// Jalankan kalkulasi setiap 1 detik
setInterval(hitungMundurJadwal, 1000);

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(hitungMundurJadwal, 500);
});