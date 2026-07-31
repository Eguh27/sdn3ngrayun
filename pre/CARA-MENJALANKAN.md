# Menjalankan website dan admin

Website ini memakai Node.js bawaan, tanpa instalasi package apa pun.

## Menjalankan di LAN

Di folder proyek, jalankan:

```bash
ADMIN_PASSWORD='ganti-password-aman' node server.js
```

Kemudian buka `http://IP-KOMPUTER:3000` dari perangkat lain yang tersambung ke Wi-Fi/LAN yang sama. Contoh: `http://192.168.1.37:3000`.

Jika port 3000 dipakai aplikasi lain:

```bash
PORT=8080 ADMIN_PASSWORD='ganti-password-aman' node server.js
```

## Dashboard admin

1. Buka `http://IP-KOMPUTER:3000/admin`.
2. Ubah isian yang diperlukan, misalnya nama kepala sekolah.
3. Tambah, ubah, atau hapus data prestasi bila diperlukan.
4. Masukkan password yang sama dengan `ADMIN_PASSWORD` saat server dijalankan.
5. Klik **Simpan perubahan**.

Data sekolah, judul halaman, dan daftar prestasi tersimpan di `data/site.json`. Salin file tersebut secara berkala sebagai cadangan. Jangan membagikan password admin ke umum; siapa pun yang tersambung ke LAN dan mengetahui password dapat mengubah konten.

## Routing yang tersedia

- `/` — halaman utama
- `/ekstrakurikuler` atau `/ekstrakurikuler.html`
- `/album` atau `/album.html`
- `/prestasi` atau `/prestasi.html`
- `/admin` — dashboard admin
- `/api/content` — data JSON untuk website dan dashboard
