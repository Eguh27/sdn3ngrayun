# Menjalankan website dan admin

Website ini memakai Node.js bawaan, tanpa instalasi package apa pun.

## Menjalankan di LAN

Di folder proyek, jalankan:

```bash
ADMIN_PASSWORD='ganti-password-aman' node server.js
```

Kemudian buka `http://IP-KOMPUTER:4147` dari perangkat lain yang tersambung ke Wi-Fi/LAN yang sama. Contoh: `http://192.168.1.37:4147`.

Jika port 4147 dipakai aplikasi lain:

```bash
PORT=8080 ADMIN_PASSWORD='ganti-password-aman' node server.js
```

## Dashboard admin

1. Buka `http://IP-KOMPUTER:4147/admin`.
2. Ubah isian yang diperlukan, misalnya nama kepala sekolah.
3. Tambah, ubah, atau hapus data prestasi bila diperlukan.
4. Masukkan password yang sama dengan `ADMIN_PASSWORD` saat server dijalankan.
5. Klik **Simpan perubahan**.

Data sekolah, judul halaman, dan daftar prestasi tersimpan di `data/site.json`. Salin file tersebut secara berkala sebagai cadangan. Jangan membagikan password admin ke umum; siapa pun yang tersambung ke LAN dan mengetahui password dapat mengubah konten.

## Menaruh gambar

Semua gambar website disimpan di folder `images/`, dibagi per kategori:

```
images/
├── profil/      → foto tampak depan, papan nama, fasilitas sekolah
├── galeri/      → belajar di kelas, upacara, lingkungan sekolah
├── ekskul/      → kegiatan ekstrakurikuler (karawitan, pramuka, olahraga, tari)
└── prestasi/    → lomba, piala, sertifikat
```

### Cara cepat (manual)

1. Konversi foto ke format **WebP** (misal lewat https://convertio.co atau perangkat lunak pengolah gambar).
2. Beri nama file yang jelas, misalnya `profil-sekolah.webp`, `upacara.webp`.
3. Salin ke folder yang sesuai, misalnya `images/profil/profil-sekolah.webp`.
4. Gunakan alamat `images/profil/profil-sekolah.webp` di halaman web.

### Cara dari dashboard admin (disarankan)

1. Login ke `http://IP-KOMPUTER:4147/admin`.
2. Gulir ke bagian **Kelola Gambar**.
3. Pilih folder tujuan (Profil / Galeri / Ekstrakurikuler / Prestasi).
4. Klik **+ Pilih Gambar**, pilih foto PNG/JPG/WebP.
5. Atur area potong (geser kotak atau tarik pojok kanan bawah), pilih rasio (1:1, 4:3, 16:9, 3:1, atau bebas), lebar hasil, dan kualitas.
6. Klik **Simpan WebP** — gambar otomatis dipotong, dikonversi ke WebP, dan tersimpan di folder yang dipilih.
7. Pada kartu gambar, gunakan tombol **Salin URL** untuk menyalin alamat yang bisa dipasang di halaman, atau **Hapus** untuk membuang gambar.

Catatan: konversi WebP dilakukan di browser (canvas), jadi tidak memerlukan package tambahan di server. Ukuran file maksimal 25 MB per gambar.

## Routing yang tersedia

- `/` — halaman utama
- `/ekstrakurikuler` atau `/ekstrakurikuler.html`
- `/album` atau `/album.html`
- `/prestasi` atau `/prestasi.html`
- `/admin` — dashboard admin
- `/images/...` — berkas gambar yang sudah diunggah
- `/api/content` — data JSON untuk website dan dashboard
- `/api/images?folder=galeri` — daftar gambar per folder (perlu login)
- `/api/upload` — unggah gambar baru (perlu login)
- `/api/image/delete` — hapus gambar (perlu login)

