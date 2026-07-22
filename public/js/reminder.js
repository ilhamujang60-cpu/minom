// public/js/reminder.js

// 1. Minta Izin Notifikasi di Browser/Perangkat saat Script Dimuat
if ("Notification" in window) {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

// Fungsi untuk Mengirim Notifikasi Sistem ke Perangkat
function kirimNotifikasiPerangkat(namaObat, jam) {
  if ("Notification" in window && Notification.permission === "granted") {
    const hariIniStr = new Date().toISOString().slice(0, 10);
    const notificationKey = `notified_${namaObat}_${jam}_${hariIniStr}`;

    // Cek apakah notifikasi untuk jam ini sudah pernah dikirim hari ini
    if (!sessionStorage.getItem(notificationKey)) {
      new Notification("💊 Waktunya Minum Obat!", {
        body: `Sudah waktunya minum ${namaObat} (Jadwal: ${jam}). Jangan lupa diminum ya!`,
        icon: "/favicon.ico", // Sesuaikan jika ada ikon aplikasi
        tag: notificationKey // Memastikan notifikasi tidak terduplikasi
      });

      // Tandai bahwa notifikasi jam ini sudah dikirim
      sessionStorage.setItem(notificationKey, "true");
    }
  }
}

function hitungMundurJadwal() {
  const cards = document.querySelectorAll('.medicine-card');
  const now = new Date();
  let perluRefresh = false;

  cards.forEach((card) => {
    const timesAttr = card.getAttribute('data-times');
    const tglSelesaiAttr = card.getAttribute('data-selesai');
    const namaObat = card.getAttribute('data-nama') || 'Obat';
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

      // Cek Waktu Hari Ini
      const targetToday = new Date(now);
      targetToday.setHours(hours, minutes, 0, 0);

      const diffToday = targetToday - now;

      // KONDISI NOTIFIKASI: Jika selisih waktu tinggal <= 0 detik (sampai toleransi -60 detik)
      if (diffToday <= 0 && diffToday >= -60000) {
        kirimNotifikasiPerangkat(namaObat, t);
      }

      if (targetToday > now) {
        // Masih ada jam konsumsi hari ini
        if (diffToday < minDiff) {
          minDiff = diffToday;
          nextTarget = targetToday;
        }
      } else {
        // Jam hari ini sudah lewat -> Cek apakah besok masih dalam periode tanggal_selesai
        const targetTomorrow = new Date(now);
        targetTomorrow.setDate(targetTomorrow.getDate() + 1);
        targetTomorrow.setHours(hours, minutes, 0, 0);

        const besokStr = targetTomorrow.toISOString().slice(0, 10);
        const cleanSelesai = tglSelesaiAttr ? tglSelesaiAttr.split('T')[0] : null;

        if (!cleanSelesai || besokStr <= cleanSelesai) {
          const diffTomorrow = targetTomorrow - now;
          if (diffTomorrow < minDiff) {
            minDiff = diffTomorrow;
            nextTarget = targetTomorrow;
          }
        }
      }
    });

    // Jika semua jadwal jam & tanggal sudah resmi selesai
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
      countdownEl.innerHTML = `🚨 <strong>WAKTUNYA MINUM OBAT! (${secs}d)</strong>`;
    }
  });

  // Hapus dari dashboard jika periode habis
  if (perluRefresh && typeof window.muatDataObat === 'function') {
    window.muatDataObat();
  }
}

// Jalankan kalkulasi setiap 1 detik
setInterval(hitungMundurJadwal, 1000);

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(hitungMundurJadwal, 500);
});