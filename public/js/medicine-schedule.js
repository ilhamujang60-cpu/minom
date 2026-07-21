// public/js/medicine-schedule.js

// Ambil ID obat dari alamat URL, misal: medicine-schedule.html?id=3 -> id = "3"
const params = new URLSearchParams(window.location.search);
const medicineId = params.get('id');

const namaEl = document.getElementById('medicine-nama');
const listEl = document.getElementById('schedule-list');
const emptyEl = document.getElementById('empty-schedule');
const form = document.getElementById('schedule-form');
const errorBox = document.getElementById('error-box');

// Kalau nggak ada ?id= di URL, ga ada obat yang mau diatur -> balik ke dashboard
if (!medicineId) {
  window.location.href = '/dashboard.html';
}

// ==========================
// Ambil data obat + jadwalnya, render ke halaman
// ==========================
async function muatData() {
  const response = await fetch(`/api/medicines/${medicineId}`);

  if (!response.ok) {
    window.location.href = '/dashboard.html';
    return;
  }

  const medicine = await response.json();
  namaEl.textContent = medicine.nama;

  listEl.innerHTML = '';
  emptyEl.style.display = medicine.schedules.length === 0 ? 'block' : 'none';

  medicine.schedules.forEach((s) => {
    const item = document.createElement('div');
    item.className = 'schedule-item';
    item.innerHTML = `
      <span class="schedule-time">🕐 ${s.jam_konsumsi}</span>
      <button class="btn-delete-small" data-id="${s.id}">Hapus</button>
    `;
    listEl.appendChild(item);
  });

  // Pasang event listener buat tiap tombol hapus jadwal
  document.querySelectorAll('.btn-delete-small').forEach((btn) => {
    btn.addEventListener('click', () => hapusJadwal(btn.dataset.id));
  });
}

// ==========================
// Tambah jadwal baru
// ==========================
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const jam_konsumsi = form.jam_konsumsi.value;

  const response = await fetch(`/api/medicines/${medicineId}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jam_konsumsi }),
  });

  const result = await response.json();

  if (!response.ok) {
    errorBox.textContent = result.error;
    errorBox.style.display = 'block';
    return;
  }

  errorBox.style.display = 'none';
  form.reset();
  muatData(); // refresh daftar jadwal
});

// ==========================
// Hapus jadwal
// ==========================
async function hapusJadwal(id) {
  await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
  muatData();
}

muatData();
