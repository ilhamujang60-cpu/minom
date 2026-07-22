// public/js/dashboard.js
// Alur file ini:
// 1. Cek dulu apakah user beneran udah login (tanya ke /api/me)
// 2. Kalau belum, tendang balik ke halaman login
// 3. Kalau udah, ambil data obat dari /api/medicines, terus "gambar" tampilannya ke HTML
// (Obat yang udah SELESAI periodenya ditampilin di halaman terpisah: riwayat.html)

const listAktifEl = document.getElementById('medicine-list-aktif');
const emptyAktifEl = document.getElementById('empty-aktif');
const userNamaEl = document.getElementById('user-nama');
const logoutBtn = document.getElementById('logout-btn');

// ==========================
// Bikin 1 kartu obat (return-nya elemen HTML yang siap ditempel ke halaman)
// ==========================
function buatKartuObat(med) {
  const card = document.createElement('div');
  card.className = 'medicine-card';

  // Atribut ini dibaca sama reminder.js buat ngitung countdown & notifikasi
  card.setAttribute('data-times', med.schedules.map((s) => s.jam_konsumsi).join(','));
  card.setAttribute('data-nama', med.nama);

  let jadwalHtml = '';
  if (med.schedules.length > 0) {
    const tags = med.schedules
      .map((s) => `<span class="schedule-tag">🕐 ${s.jam_konsumsi}</span>`)
      .join('');
    jadwalHtml = `
      <p class="schedule-tags">${tags}</p>
      <p class="countdown-text">Menghitung...</p>
    `;
  } else {
    jadwalHtml = `<p class="empty-note">Belum ada jadwal jam.</p>`;
  }

  card.innerHTML = `
    <span class="badge badge-${med.jenis}">${med.jenis}</span>
    <h3>${med.nama}</h3>
    <p><strong>Dosis:</strong> ${med.dosis || '-'}</p>
    <p><strong>Periode:</strong> ${med.tanggal_mulai || '-'} s/d ${med.tanggal_selesai || 'tanpa batas'}</p>
    ${med.catatan ? `<p><strong>Catatan:</strong> ${med.catatan}</p>` : ''}
    ${jadwalHtml}
    <div class="card-actions">
      <a href="/medicine-schedule.html?id=${med.id}" class="btn-secondary btn-small">⏰ Atur Jadwal</a>
      <button class="btn-delete" data-id="${med.id}" data-nama="${med.nama}">Hapus</button>
    </div>
  `;

  return card;
}

// ==========================
// Hapus obat (dipanggil pas tombol "Hapus" diklik)
// ==========================
async function hapusObat(id, nama) {
  const yakin = confirm(`Yakin mau hapus ${nama}?`);
  if (!yakin) return;

  await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
  muatDataObat(); // refresh tampilan setelah hapus
}

// ==========================
// Ambil data obat dari server, terus render ke halaman (cuma yang AKTIF)
// ==========================
async function muatDataObat() {
  const response = await fetch('/api/medicines');
  const medicines = await response.json();

  const hariIni = new Date().toISOString().slice(0, 10); // format "YYYY-MM-DD"
  const aktif = medicines.filter((m) => !m.tanggal_selesai || m.tanggal_selesai > hariIni);

  listAktifEl.innerHTML = '';
  emptyAktifEl.style.display = aktif.length === 0 ? 'block' : 'none';
  aktif.forEach((med) => listAktifEl.appendChild(buatKartuObat(med)));

  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => hapusObat(btn.dataset.id, btn.dataset.nama));
  });
}

// ==========================
// Cek status login dulu sebelum nampilin apa-apa
// ==========================
async function init() {
  const response = await fetch('/api/me');
  const data = await response.json();

  if (!data.loggedIn) {
    window.location.href = '/login.html';
    return;
  }

  userNamaEl.textContent = data.nama;
  muatDataObat();
}

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

init();
