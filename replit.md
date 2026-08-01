# SDN 3 Ngrayun — Website Profil Sekolah

Website profil resmi SD Negeri 3 Ngrayun, Desa Sambiganen, Kecamatan Ngrayun, Kabupaten Ponorogo, Jawa Timur.

## Stack

- **Runtime**: Node.js 20 — server.js (zero dependencies, pure Node built-ins)
- **Frontend**: HTML + CSS + vanilla JS (tidak ada framework)
- **Data**: JSON files di `data/` (site.json, prestasi.json, ekstrakurikuler.json, news.json, videos.json)
- **Gambar**: Disimpan di `images/` (subfolder: profil, galeri, ekskul, prestasi)

## Cara menjalankan

```bash
node server.js
```

Server berjalan di port **5000** (dikonfigurasi via env var `PORT`).

## Halaman

| URL                  | File               | Keterangan                        |
|---------------------|--------------------|-----------------------------------|
| `/`                 | index.html         | Beranda utama                     |
| `/admin`            | admin-login.html   | Halaman login admin               |
| `/admin/dashboard`  | admin.html         | Dashboard admin (perlu login)     |
| `/ekstrakurikuler`  | ekstrakurikuler.html | Detail ekskul                   |
| `/album`            | album.html         | Album galeri                      |
| `/prestasi`         | prestasi.html      | Arsip prestasi                    |
| `/berita`           | berita.html        | Halaman berita                    |
| `/video`            | video.html         | Halaman video                     |

## API endpoints

- `GET /api/content` — data school + images (site.json)
- `GET/PUT /api/prestasi` — data prestasi
- `GET/PUT /api/ekstrakurikuler` — data ekskul
- `GET/PUT /api/news` — data berita
- `GET/PUT /api/videos` — data video
- `POST /api/admin/login` — login admin
- `POST /api/admin/logout` — logout
- `GET /api/images?folder=` — daftar gambar (admin only)
- `POST /api/upload` — upload gambar (admin only)
- `POST /api/image/delete` — hapus gambar (admin only)

## Secrets yang diperlukan

- `ADMIN_PASSWORD` — password untuk login ke `/admin`
- `SESSION_SECRET` — diset tapi belum dipakai server saat ini

## Cara mengelola konten

1. Buka `/admin` dan login dengan `ADMIN_PASSWORD`
2. Edit data sekolah, prestasi, berita, video, atau upload foto
3. Untuk foto: upload di bagian "Foto untuk website", lalu pilih slot "Pasang sebagai" agar foto muncul di halaman publik
4. Klik "Simpan perubahan"

## Struktur data gambar

Foto yang sudah di-upload disimpan di `images/<folder>/`. Untuk tampil di website, URL foto harus disimpan ke `data/site.json` via fitur "Pasang sebagai" di dashboard admin.

## User preferences

- Pertahankan struktur HTML/CSS/JS murni tanpa framework
- Tidak ada npm dependencies — server.js hanya pakai Node built-ins
