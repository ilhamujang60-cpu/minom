// public/js/bg-dots.js
// Bikin titik-titik putih kecil yang "ngambang" naik ke atas di background,
// dijalanin di SEMUA halaman biar konsisten. Ini cuma dekorasi -> nggak
// pernah diklik/interaktif, makanya dikasih pointer-events:none.

function buatBackgroundDots() {
  const container = document.createElement('div');
  container.className = 'bg-dots-container';

  const JUMLAH_DOT = 25;

  for (let i = 0; i < JUMLAH_DOT; i++) {
    const dot = document.createElement('span');
    dot.className = 'bg-dot';

    // Random posisi kiri-kanan, ukuran, kecepatan, & delay -> biar keliatan natural/acak
    const kiri = Math.random() * 100; // persen dari lebar layar
    const ukuran = 3 + Math.random() * 6; // 3px - 9px
    const durasi = 10 + Math.random() * 15; // 10 - 25 detik buat naik
    const delay = Math.random() * durasi * -1; // mulai di tengah animasi, biar ga muncul serentak
    const opasitas = 0.2 + Math.random() * 0.4; // 0.2 - 0.6, biar subtle

    dot.style.left = `${kiri}%`;
    dot.style.width = `${ukuran}px`;
    dot.style.height = `${ukuran}px`;
    dot.style.animationDuration = `${durasi}s`;
    dot.style.animationDelay = `${delay}s`;
    dot.style.opacity = opasitas;

    container.appendChild(dot);
  }

  document.body.prepend(container);
}

buatBackgroundDots();
