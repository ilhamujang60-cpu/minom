// public/js/medicine-add.js

const form = document.getElementById('medicine-form');
const errorBox = document.getElementById('error-box');

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const data = {
    nama: form.nama.value,
    dosis: form.dosis.value,
    jenis: form.jenis.value,
    tanggal_mulai: form.tanggal_mulai.value,
    tanggal_selesai: form.tanggal_selesai.value,
    catatan: form.catatan.value,
  };

  try {
    const response = await fetch('/api/medicines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      errorBox.textContent = result.error;
      errorBox.style.display = 'block';
      return;
    }

    window.location.href = '/dashboard.html';
  } catch (err) {
    errorBox.textContent = 'Gagal menghubungi server. Coba lagi.';
    errorBox.style.display = 'block';
  }
});
