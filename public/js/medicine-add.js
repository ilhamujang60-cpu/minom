// public/js/medicine-add.js

const form = document.getElementById('medicine-form');
const errorBox = document.getElementById('error-box');

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  // Reset tampilan error box sebelum mengirim request baru
  if (errorBox) {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }

  const data = {
    nama_obat: form.nama.value, // <--- DISESUAIKAN: Diubah dari 'nama' menjadi 'nama_obat'
    dosis: form.dosis.value,
    jenis: form.jenis.value,
    tanggal_mulai: form.tanggal_mulai.value,
    tanggal_selesai: form.tanggal_selesai.value,
    catatan: form.catatan.value,
  };

  // Menerima nama_obat ATAU nama dari req.body
  const nama_obat = req.body.nama_obat || req.body.nama;
  const { dosis, jenis, tanggal_mulai, tanggal_selesai, catatan } = req.body;

  if (!nama_obat) {
  return res.status(400).json({ error: 'Nama obat wajib diisi.' });
  }

  try {
    const response = await fetch('/api/medicines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Tampilkan pesan error spesifik yang dikirim oleh backend
      errorBox.textContent = result.error || result.message || 'Gagal menyimpan data.';
      errorBox.style.display = 'block';
      return;
    }
    

    // Berhasil simpan -> Pindah ke dashboard
    window.location.href = '/dashboard.html';
  } catch (err) {
    console.error('Fetch error:', err);
    errorBox.textContent = 'Gagal menghubungi server. Coba lagi.';
    errorBox.style.display = 'block';
  }
});