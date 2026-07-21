// public/js/riwayat.js
// Sama alurnya kayak dashboard.js, tapi cuma nampilin obat yang PERIODENYA UDAH SELESAI

const listRiwayatEl = document.getElementById('medicine-list-riwayat');
const emptyRiwayatEl = document.getElementById('empty-riwayat');
const userNamaEl = document.getElementById('user-nama');
const logoutBtn = document.getElementById('logout-btn');

function buatKartuRiwayat(med) {
  const card = document.createElement('div');
  card.className = 'medicine-card medicine-card-riwayat';

  card.innerHTML = `
    <span class="badge badge-selesai">Selesai</span>
    <h3>${med.nama}</h3>
    <p><strong>Dosis:</strong> ${med.dosis || '-'}</p>
    <p><strong>Periode:</strong> ${med.tanggal_mulai || '-'} s/d ${med.tanggal_selesai}</p>
    ${med.catatan ? `<p><strong>Catatan:</strong> ${med.catatan}</p>` : ''}
    <div class="card-actions">
      <button class="btn-delete" data-id="${med.id}" data-nama="${med.nama}">Hapus dari Riwayat</button>
    </div>
  `;

  return card;
}

async function hapusObat(id, nama) {
  const yakin = confirm(`Yakin mau hapus ${nama} dari riwayat?`);
  if (!yakin) return;

  await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
  muatRiwayat();
}

async function muatRiwayat() {
  const response = await fetch('/api/medicines');
  const medicines = await response.json();

  const hariIni = new Date().toISOString().slice(0, 10);
  const riwayat = medicines.filter((m) => m.tanggal_selesai && m.tanggal_selesai < hariIni);

  listRiwayatEl.innerHTML = '';
  emptyRiwayatEl.style.display = riwayat.length === 0 ? 'block' : 'none';
  riwayat.forEach((med) => listRiwayatEl.appendChild(buatKartuRiwayat(med)));

  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => hapusObat(btn.dataset.id, btn.dataset.nama));
  });
}

async function init() {
  const response = await fetch('/api/me');
  const data = await response.json();

  if (!data.loggedIn) {
    window.location.href = '/login.html';
    return;
  }

  userNamaEl.textContent = data.nama;
  muatRiwayat();
}

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

init();
