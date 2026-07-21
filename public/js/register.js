// public/js/register.js
// Tugas file ini: pas form di-submit, JANGAN reload halaman (default browser),
// tapi kirim datanya ke server lewat fetch(), terus urus hasilnya sendiri.

const form = document.getElementById('register-form');
const errorBox = document.getElementById('error-box');

form.addEventListener('submit', async function (event) {
  event.preventDefault(); // cegah browser reload halaman kayak form biasa

  // Ambil semua data dari form, dijadiin object biasa
  const data = {
    nama: form.nama.value,
    email: form.email.value,
    password: form.password.value,
    konfirmasi_password: form.konfirmasi_password.value,
  };

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Server bilang ada yang salah (misal email udah kepake) -> tampilin errornya
      errorBox.textContent = result.error;
      errorBox.style.display = 'block';
      return;
    }

    // Sukses -> arahkan ke halaman login
    window.location.href = '/login.html?registered=1';
  } catch (err) {
    errorBox.textContent = 'Gagal menghubungi server. Coba lagi.';
    errorBox.style.display = 'block';
  }
});
