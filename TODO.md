# TODO — Terapkan Data dari Form Input Wawancara + Kelola Gambar

## Tugas utama — data dari Form Wawancara
- [x] Baca dan pahami isi Form Input Wawancara SDN 3 Ngrayun.docx
- [x] Rencana disetujui pengguna
- [x] Update data/ekstrakurikuler.json (4 ekskul aktif + jadwal)
- [x] Update data/prestasi.json (4 prestasi asli)
- [x] Update index.html: visi statis, nama kepsek, kartu ekskul, baris prestasi
- [x] Update index.html: NPSN, Akreditasi, Tahun Berdiri pada info card
- [x] Tambah section "Pembiasaan Harian" di index.html
- [x] Tambah gaya CSS untuk section Pembiasaan Harian
- [x] Update ekstrakurikuler.html & prestasi.html (fallback statis konsisten)
- [x] Verifikasi hasil (JSON valid, API merespons, halaman render)

## Tugas baru — folder gambar + crop & auto-convert WebP di dashboard
- [x] Buat folder `images/profil`, `images/galeri`, `images/ekskul`, `images/prestasi` (+ .gitkeep)
- [x] Tambah endpoint server: `GET /api/images`, `POST /api/upload`, `POST /api/image/delete` (auth + sanitasi + path traversal guard)
- [x] Tambah MIME image & perluas body-size limit di server.js
- [x] Tambah section "Kelola Gambar" di admin.html (pilih folder, pilih file, daftar gambar)
- [x] Tambah modal crop di admin.html (kotak geser/resize, rasio, lebar, kualitas)
- [x] Implementasi crop + auto-convert WebP (canvas) di js/admin.js
- [x] Tambah styling image manager & crop modal di css/style.css
- [x] Update pre/CARA-MENJALANKAN.md (port 4147, struktur folder, panduan upload)
- [x] Uji API: login/auth, list, upload, static serve, delete, path traversal (semua lolos)
- [x] Uji sintaks server.js & js/admin.js (node --check lolos)

