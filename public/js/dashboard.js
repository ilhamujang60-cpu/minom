// public/js/dashboard.js

const listAktifEl = document.getElementById('medicine-list-aktif');
const emptyAktifEl = document.getElementById('empty-aktif');
const userNamaEl = document.getElementById('user-nama');
const logoutBtn = document.getElementById('logout-btn');

function buatKartuObat(med) {
  const card = document.createElement('div');
  card.className = 'medicine-card';

  const schedules = Array.isArray(med.schedules) ? med.schedules : [];
  const namaObat = med.nama || med.nama_obat || 'Obat';

  const tglMulai = med.tanggal_mulai ? med.tanggal_mulai.toString().split('T')[0] : '-';
  const tglSelesai = med.tanggal_selesai ? med.tanggal_selesai.toString().split('T')[0] : 'tanpa batas';

  // Atribut untuk dibaca oleh reminder.js (termasuk data-selesai)
  card.setAttribute('data-times', schedules.map((s) => s.jam_konsumsi || s.waktu).join(','));
  card.setAttribute('data-nama', namaObat);
  card.setAttribute('data-selesai', med.tanggal_selesai || '');

  let jadwalHtml = '';
  if (schedules.length > 0) {
    const tags = schedules
      .map((s) => `<span class="schedule-tag">🕐 ${s.jam_konsumsi || s.waktu}</span>`)
      .join('');
    jadwalHtml = `
      <p class="schedule-tags">${tags}</p>
      <p class="countdown-text" style="font-weight: bold; color: #0284c7; margin-top: 6px;">Menghitung...</p>
    `;
  } else {
    jadwalHtml = `<p class="empty-note">Belum ada jadwal jam.</p>`;
  }

  card.innerHTML = `
    <span class="badge badge-${med.jenis || 'Obat'}">${med.jenis || 'Obat'}</span>
    <h3>${namaObat}</h3>
    <p><strong>Dosis:</strong> ${med.dosis || '-'}</p>
    <p><strong>Periode:</strong> ${tglMulai} s/d ${tglSelesai}</p>
    ${med.catatan ? `<p><strong>Catatan:</strong> ${med.catatan}</p>` : ''}
    ${jadwalHtml}
    <div class="card-actions">
      <a href="/medicine-schedule.html?id=${med.id}" class="btn-secondary btn-small">⏰ Atur Jadwal</a>
      <button class="btn-delete" data-id="${med.id}" data-nama="${namaObat}">Hapus</button>
    </div>
  `;

  return card;
}

async function hapusObat(id, nama) {
  const yakin = confirm(`Yakin mau hapus ${nama}?`);
  if (!yakin) return;

  await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
  muatDataObat();
}

// Fungsi Muat Data Obat Aktif
async function muatDataObat() {
  try {
    const response = await fetch('/api/medicines');
    if (!response.ok) return;

    const medicines = await response.json();
    if (!Array.isArray(medicines)) return;

    const now = new Date();
    const hariIni = now.toISOString().slice(0, 10);

    // Filter obat yang masih aktif
    const aktif = medicines.filter((m) => {
      if (!m.tanggal_selesai) return true; // Tanpa batas waktu
      const tglSelesaiClean = m.tanggal_selesai.toString().split('T')[0];
      
      // Jika tanggal selesai masih hari esok/nanti -> Masih aktif
      if (tglSelesaiClean > hariIni) return true;
      
      // Jika tanggal selesai HARI INI, cek apakah jadwal jam terakhir sudah lewat
      if (tglSelesaiClean === hariIni) {
        if (!m.schedules || m.schedules.length === 0) return true;
        
        // Cari jam konsumsi paling akhir pada hari ini
        const hasUpcoming = m.schedules.some((s) => {
          const timeStr = s.jam_konsumsi || s.waktu;
          if (!timeStr) return false;
          const [h, min] = timeStr.split(':').map(Number);
          const target = new Date(now);
          target.setHours(h, min, 0, 0);
          return target > now; // Masih ada jam konsumsi mendatang hari ini
        });

        return hasUpcoming; // Jika semua jam hari ini sudah lewat, return false (otomatis masuk riwayat)
      }

      return false;
    });

    if (listAktifEl) listAktifEl.innerHTML = '';
    if (emptyAktifEl) emptyAktifEl.style.display = aktif.length === 0 ? 'block' : 'none';

    aktif.forEach((med) => {
      if (listAktifEl) listAktifEl.appendChild(buatKartuObat(med));
    });

    document.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', () => hapusObat(btn.dataset.id, btn.dataset.nama));
    });
  } catch (err) {
    console.error('Error muat data obat:', err);
  }
}

// Ekspor agar bisa dipanggil otomatis oleh reminder.js
window.muatDataObat = muatDataObat;

async function init() {
  try {
    const response = await fetch('/api/me');
    const data = await response.json();

    if (!data.loggedIn) {
      window.location.href = '/login.html';
      return;
    }

    if (userNamaEl) userNamaEl.textContent = data.nama;
    muatDataObat();
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