# TODO — Implementasi Permintaan Pengguna

## 1. Favicon
- [x] Buat `favicon.svg` (logo S3 hijau-kapur, tema sekolah)
- [x] Tambah `<link rel="icon">` di 8 halaman HTML (index, admin-login, admin, album, berita, ekstrakurikuler, prestasi, video)

## 2. Foto Guru & Staf via Admin
- [x] Tambah `school.staff` (array `{name, role, photo}`) di `data/site.json`
- [x] `index.html`: tambah foto kepala sekolah (`data-principal-photo`) + grid "Guru & Staf" (`[data-staff]`)
- [x] `js/content.js`: render foto kepala sekolah + kartu staff dari data
- [x] `admin.html`: section baru "Guru & Staf" (nama, jabatan, upload foto ke folder `profil`)
- [x] `js/admin.js`: render + simpan staff, upload foto
- [x] `css/style.css`: styling kartu staff & foto kepala sekolah

## 3. Keterangan Galeri via Admin
- [x] Tambah `content.galleryInfo` (judul & keterangan per 6 slot) di `data/site.json`
- [x] `js/content.js`: injeksi judul/keterangan galeri dari `galleryInfo` ke index & album
- [x] `js/admin.js`: kolom judul & keterangan di kartu slot galeri + simpan
- [x] Dukungan galeri dinamis (tambah/hapus slot) via `galleryOrder` + "Tambah galeri" di admin

## 4. Audit & Perbaikan + Data Dummy
- [x] Perbaiki bug upload foto berita (tombol keluar dari label → pakai `.img-field-wrap`)
- [x] Isi data dummy: `data/news.json` (3 berita lengkap) & `data/videos.json` (3 video YouTube contoh)
- [x] Perbaiki teks internal yang bocor ke publik (Perbarui di Admin, tips foto, instruksi album/prestasi)
- [x] Konsistensi port & docs (replit.md: default 4147 vs PORT=5000 di Replit, hapus SESSION_SECRET)
- [x] Perbaiki `js/detail-card.js` agar kartu galeri dinamis berfungsi (event delegation)
- [x] Verifikasi akhir: `node --check` semua JS, jalankan server, cek semua API & halaman
</content>
