// public/js/login.js

const form = document.getElementById('login-form');
const errorBox = document.getElementById('error-box');
const successBox = document.getElementById('success-box');

// Cek apakah user baru aja selesai register (dari URL: login.html?registered=1)
// URLSearchParams itu cara baca "?key=value" di alamat browser
const params = new URLSearchParams(window.location.search);
if (params.get('registered') === '1') {
  successBox.style.display = 'block';
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const data = {
    email: form.email.value,
    password: form.password.value,
  };

  try {
    const response = await fetch('/api/login', {
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

    // Login sukses -> server udah bikin session (cookie otomatis kesimpen browser)
    window.location.href = '/dashboard.html';
  } catch (err) {
    errorBox.textContent = 'Gagal menghubungi server. Coba lagi.';
    errorBox.style.display = 'block';
  }
});
