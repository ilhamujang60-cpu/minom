document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('form'); // Sesuaikan selector jika menggunakan ID/Class

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Mencegah reload halaman
      console.log('Tombol Masuk diklik!');

      // Ambil nilai input
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');

      const email = emailInput ? emailInput.value : '';
      const password = passwordInput ? passwordInput.value : '';

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('Respon dari server:', data);

        if (response.ok) {
          alert('Login Berhasil!');
          // window.location.href = '/dashboard.html';
        } else {
          alert(data.message || 'Gagal masuk');
        }
      } catch (error) {
        console.error('Error saat menghubungi server:', error);
      }
    });
  } else {
    console.error('Form login tidak ditemukan di DOM!');
  }
});