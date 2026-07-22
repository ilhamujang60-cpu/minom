// public/js/reminder.js

// Fungsi Minta Izin Notifikasi (Harus dipanggil lewat klik tombol/aksi pengguna)
async function mintaIzinNotifikasi() {
  if (!("Notification" in window)) {
    alert("Browser Anda tidak mendukung Notifikasi Perangkat.");
    return false;
  }

  let permission = Notification.permission;

  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    new Notification("💊 Notifikasi Minom Aktif!", {
      body: "Pengingat jadwal minum obat berhasil diaktifkan.",
      icon: "/favicon.ico"
    });
    return true;
  } else {
    alert("Izin notifikasi ditolak. Harap izinkan notifikasi dari setelan browser Anda.");
    return false;
  }
}

// Fungsi Mengirim Notifikasi
function kirimNotifikasiPerangkat(namaObat, jam) {
  if ("Notification" in window && Notification.permission === "granted") {
    const hariIniStr = new Date().toISOString().slice(0, 10);
    const notificationKey = `notified_${namaObat}_${jam}_${hariIniStr}`;

    // Cek agar tidak terkirim double dalam 1 hari
    if (!sessionStorage.getItem(notificationKey)) {
      new Notification("💊 Waktunya Minum Obat!", {
        body: `Sudah waktunya minum ${namaObat} (Jadwal: ${jam}). Jangan lupa diminum ya!`,
        icon: "/favicon.ico",
        tag: notificationKey
      });

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

      const targetToday = new Date(now);
      targetToday.setHours(hours, minutes, 0, 0);

      const diffToday = targetToday - now;

      // TRIGGER NOTIFIKASI: Saat selisih waktu tinggal <= 0 detik (sampai 60 detik setelahnya)
      if (diffToday <= 0 && diffToday >= -60000) {
        kirimNotifikasiPerangkat(namaObat, t);
      }

      if (targetToday > now) {
        if (diffToday < minDiff) {
          minDiff = diffToday;
          nextTarget = targetToday;
        }
      } else {
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

    if (!nextTarget) {
      perluRefresh = true;
      return;
    }

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

  if (perluRefresh && typeof window.muatDataObat === 'function') {
    window.muatDataObat();
  }
}

// Ekspor ke window agar bisa dipanggil tombol di HTML
window.mintaIzinNotifikasi = mintaIzinNotifikasi;

setInterval(hitungMundurJadwal, 1000);

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(hitungMundurJadwal, 500);
});