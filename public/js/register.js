document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const errorBox = document.getElementById('error-box');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Mencegah halaman reload

      // Sembunyikan pesan error sebelumnya
      errorBox.style.display = 'none';
      errorBox.textContent = '';

      // Ambil nilai dari input HTML
      const nama = document.getElementById('nama').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const konfirmasiPassword = document.getElementById('konfirmasi_password').value;

      // Validasi kata sandi di sisi klien
      if (password !== konfirmasiPassword) {
        errorBox.textContent = 'Konfirmasi password tidak cocok!';
        errorBox.style.display = 'block';
        return;
      }

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nama, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Pendaftaran berhasil! Silakan masuk.');
          window.location.href = '/login.html';
        } else {
          errorBox.textContent = data.message || 'Gagal mendaftar. Silakan coba lagi.';
          errorBox.style.display = 'block';
        }
      } catch (error) {
        console.error('Error:', error);
        errorBox.textContent = 'Terjadi kesalahan pada server/jaringan.';
        errorBox.style.display = 'block';
      }
    });
  }
});