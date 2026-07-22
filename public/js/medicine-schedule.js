// public/js/medicine-schedule.js

const params = new URLSearchParams(window.location.search);
const medicineId = params.get('id');

const namaEl = document.getElementById('medicine-nama');
const listEl = document.getElementById('schedule-list');
const emptyEl = document.getElementById('empty-schedule');
const form = document.getElementById('schedule-form');
const errorBox = document.getElementById('error-box');
const countdownBox = document.getElementById('countdown-box');

let currentSchedules = [];
let timerInterval = null;

if (!medicineId) {
  window.location.href = '/dashboard.html';
}

// Fungsi Hitung Mundur Real-time
function updateCountdown() {
  if (!countdownBox) return;

  if (currentSchedules.length === 0) {
    countdownBox.style.display = 'none';
    return;
  }

  const now = new Date();
  let minDiff = Infinity;
  let nextTarget = null;

  currentSchedules.forEach((s) => {
    const timeStr = s.jam_konsumsi || s.waktu;
    if (!timeStr) return;

    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1); // Hitung besok
    }

    const diff = target - now;
    if (diff < minDiff) {
      minDiff = diff;
      nextTarget = target;
    }
  });

  if (nextTarget && minDiff !== Infinity) {
    countdownBox.style.display = 'block';
    const totalSeconds = Math.floor(minDiff / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (totalSeconds <= 0) {
      countdownBox.innerHTML = `🚨 <span style="color: #d97706;">Waktunya minum obat sekarang!</span>`;
    } else if (hrs > 0) {
      countdownBox.innerHTML = `⏳ Minum berikutnya dalam <strong>${hrs} jam ${mins} mnt ${secs} dtk lagi</strong>`;
    } else if (mins > 0) {
      countdownBox.innerHTML = `⏳ Minum berikutnya dalam <strong>${mins} mnt ${secs} dtk lagi</strong>`;
    } else {
      countdownBox.innerHTML = `⏳ Minum berikutnya dalam <strong>${secs} dtk lagi</strong>`;
    }
  }
}

// Ambil data obat & jadwal
async function muatData() {
  try {
    const response = await fetch(`/api/medicines/${medicineId}`);

    if (!response.ok) {
      window.location.href = '/dashboard.html';
      return;
    }

    const medicine = await response.json();
    if (namaEl) namaEl.textContent = medicine.nama || medicine.nama_obat || 'Obat';

    if (listEl) listEl.innerHTML = '';
    
    currentSchedules = Array.isArray(medicine.schedules) ? medicine.schedules : [];
    if (emptyEl) emptyEl.style.display = currentSchedules.length === 0 ? 'block' : 'none';

    currentSchedules.forEach((s) => {
      const jamText = s.jam_konsumsi || s.waktu || '-';
      const item = document.createElement('div');
      item.className = 'schedule-item';
      item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;';
      item.innerHTML = `
        <span class="schedule-time" style="font-weight: 600; color: #0284c7;">🕐 ${jamText}</span>
        <button class="btn-delete-small" data-id="${s.id}" style="background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer;">Hapus</button>
      `;
      if (listEl) listEl.appendChild(item);
    });

    document.querySelectorAll('.btn-delete-small').forEach((btn) => {
      btn.addEventListener('click', () => hapusJadwal(btn.dataset.id));
    });

    // Jalankan timer per detik
    if (timerInterval) clearInterval(timerInterval);
    updateCountdown();
    timerInterval = setInterval(updateCountdown, 1000);

  } catch (err) {
    console.error('Error pada muatData:', err);
  }
}

// Submit Form Tambah Jam
if (form) {
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (errorBox) {
      errorBox.style.display = 'none';
      errorBox.textContent = '';
    }

    const jamInput = document.getElementById('jam_konsumsi') || form.querySelector('input[type="time"]');
    const jam_konsumsi = jamInput ? jamInput.value : '';

    if (!jam_konsumsi) {
      if (errorBox) {
        errorBox.textContent = 'Pilih jam terlebih dahulu.';
        errorBox.style.display = 'block';
      }
      return;
    }

    try {
      const response = await fetch(`/api/medicines/${medicineId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jam_konsumsi }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (errorBox) {
          errorBox.textContent = result.error || 'Gagal menyimpan jadwal.';
          errorBox.style.display = 'block';
        }
        return;
      }

      if (jamInput) jamInput.value = '';
      muatData(); // Refresh jadwal & hitung mundur
    } catch (err) {
      console.error('Error submit jadwal:', err);
    }
  });
}

// Hapus Jam
async function hapusJadwal(id) {
  try {
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    muatData();
  } catch (err) {
    console.error('Error hapus jadwal:', err);
  }
}

muatData();