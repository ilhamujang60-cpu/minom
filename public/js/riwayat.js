// public/js/riwayat.js
// Nampilin obat yang PERIODENYA UDAH SELESAI (tanggal_selesai < hari ini)

const listRiwayatEl = document.getElementById('medicine-list-riwayat');
const emptyRiwayatEl = document.getElementById('empty-riwayat');
const userNamaEl = document.getElementById('user-nama');
const logoutBtn = document.getElementById('logout-btn');

// ==========================
// Bikin 1 kartu obat riwayat
// ==========================
function buatKartuRiwayat(med) {
  const card = document.createElement('div');
  card.className = 'medicine-card medicine-card-riwayat';

  // Bersihkan format tanggal ISO (misal: "2026-07-22T00:00:00.000Z" -> "2026-07-22")
  const tglMulai = med.tanggal_mulai ? med.tanggal_mulai.toString().split('T')[0] : '-';
  const tglSelesai = med.tanggal_selesai ? med.tanggal_selesai.toString().split('T')[0] : '-';
  const namaObat = med.nama || med.nama_obat || 'Obat';

  card.innerHTML = `
    <span class="badge badge-selesai">Selesai</span>
    <h3>${namaObat}</h3>
    <p><strong>Dosis:</strong> ${med.dosis || '-'}</p>
    <p><strong>Periode:</strong> ${tglMulai} s/d ${tglSelesai}</p>
    ${med.catatan ? `<p><strong>Catatan:</strong> ${med.catatan}</p>` : ''}
    <div class="card-actions">
      <button class="btn-delete" data-id="${med.id}" data-nama="${namaObat}">Hapus dari Riwayat</button>
    </div>
  `;

  return card;
}

// ==========================
// Hapus obat dari riwayat
// ==========================
async function hapusObat(id, nama) {
  const yakin = confirm(`Yakin mau hapus ${nama} dari riwayat?`);
  if (!yakin) return;

  try {
    await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
    muatRiwayat(); // Refresh daftar riwayat setelah dihapus
  } catch (err) {
    console.error('Error hapus riwayat:', err);
  }
}

// ==========================
// Ambil data obat & filter yang sudah selesai
// ==========================
async function muatRiwayat() {
  try {
    const response = await fetch('/api/medicines');
    
    if (response.status === 401) {
      window.location.href = '/login.html';
      return;
    }

    const medicines = await response.json();
    if (!Array.isArray(medicines)) return;

    // Dapatkan tanggal hari ini (Format: "YYYY-MM-DD")
    const hariIni = new Date().toISOString().slice(0, 10);

    // Filter obat yang tanggal_selesai-nya lebih kecil (<) dari hari ini
    const riwayat = medicines.filter((m) => {
      if (!m.tanggal_selesai) return false;
      const tglSelesaiClean = m.tanggal_selesai.toString().split('T')[0];
      return tglSelesaiClean < hariIni;
    });

    if (listRiwayatEl) listRiwayatEl.innerHTML = '';
    if (emptyRiwayatEl) emptyRiwayatEl.style.display = riwayat.length === 0 ? 'block' : 'none';

    riwayat.forEach((med) => {
      if (listRiwayatEl) listRiwayatEl.appendChild(buatKartuRiwayat(med));
    });

    document.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', () => hapusObat(btn.dataset.id, btn.dataset.nama));
    });
  } catch (err) {
    console.error('Error muat riwayat:', err);
  }
}

// ==========================
// Cek status login & inisialisasi
// ==========================
async function init() {
  try {
    const response = await fetch('/api/me');
    const data = await response.json();

    if (!data.loggedIn) {
      window.location.href = '/login.html';
      return;
    }

    if (userNamaEl) userNamaEl.textContent = data.nama;
    muatRiwayat();
  } catch (err) {
    console.error('Init error:', err);
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });
}

init();