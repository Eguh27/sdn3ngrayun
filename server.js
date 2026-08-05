#!/usr/bin/env node

/* Server statis + API konten untuk SDN 3 Ngrayun. Tidak memakai dependency. */
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const CONTENT_FILE = path.join(ROOT, 'data', 'site.json');
const DATA_FILES = {
  '/api/content': CONTENT_FILE,
  '/api/prestasi': path.join(ROOT, 'data', 'prestasi.json'),
  '/api/ekstrakurikuler': path.join(ROOT, 'data', 'ekstrakurikuler.json'),
  '/api/news': path.join(ROOT, 'data', 'news.json'),
  '/api/videos': path.join(ROOT, 'data', 'videos.json')
};
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 4147);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();
const MIME = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.ico': 'image/x-icon' };
const IMAGES_DIR = path.join(ROOT, 'images');
const IMAGE_FOLDERS = new Set(['profil', 'galeri', 'ekskul', 'prestasi']);
const BACKUP_DIR = path.join(ROOT, 'backups');
const BACKUP_PREFIX = 'sdn3ngrayun-backup-';
const DATA_BASENAMES = {};
Object.keys(DATA_FILES).forEach((key) => {
  DATA_BASENAMES[path.basename(DATA_FILES[key])] = DATA_FILES[key];
});

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function createBackup() {
  await fsp.mkdir(BACKUP_DIR, { recursive: true });
  const snapshot = { createdAt: new Date().toISOString(), files: {} };
  for (const basename of Object.keys(DATA_BASENAMES)) {
    try {
      snapshot.files[basename] = JSON.parse(await fsp.readFile(DATA_BASENAMES[basename], 'utf8'));
    } catch {
      /* lewati file data yang belum ada */
    }
  }
  if (!Object.keys(snapshot.files).length) throw new Error('Tidak ada data untuk di-backup.');
  const name = `${BACKUP_PREFIX}${stamp()}.json`;
  await fsp.writeFile(path.join(BACKUP_DIR, name), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  return name;
}

async function listBackups() {
  await fsp.mkdir(BACKUP_DIR, { recursive: true });
  const entries = await fsp.readdir(BACKUP_DIR, { withFileTypes: true });
  return await Promise.all(entries.filter((entry) => entry.isFile() && entry.name.startsWith(BACKUP_PREFIX) && entry.name.endsWith('.json')).map(async (entry) => {
    const stat = await fsp.stat(path.join(BACKUP_DIR, entry.name));
    let createdAt = '';
    try {
      const parsed = JSON.parse(await fsp.readFile(path.join(BACKUP_DIR, entry.name), 'utf8'));
      createdAt = parsed.createdAt || '';
    } catch {
      /* backup lama tanpa metadata */
    }
    return { name: entry.name, size: stat.size, createdAt };
  }).sort((a, b) => b.name.localeCompare(a.name)));
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function passwordMatches(password) {
  if (!ADMIN_PASSWORD) return false;
  const received = Buffer.from(password);
  const expected = Buffer.from(ADMIN_PASSWORD);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function sessionToken(req) {
  const cookies = String(req.headers.cookie || '').split(';');
  const session = cookies.find((cookie) => cookie.trim().startsWith('sdn_admin_session='));
  return session ? decodeURIComponent(session.split('=').slice(1).join('=').trim()) : '';
}

function sessionAuthorised(req) {
  const token = sessionToken(req);
  const expiresAt = sessions.get(token);
  if (!expiresAt || expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return false;
  }
  return true;
}

function authorised(req) {
  if (sessionAuthorised(req)) return true;
  const header = req.headers.authorization || '';
  const [kind, encoded] = header.split(' ');
  if (kind !== 'Basic' || !encoded) return false;
  const [, password = ''] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
  return passwordMatches(password);
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 30_000_000) throw new Error('Payload terlalu besar');
  }
  return body;
}

function validContent(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && value.school && typeof value.school === 'object';
}

function validData(value, pathname) {
  if (pathname === '/api/content') return validContent(value);
  return value && typeof value === 'object' && !Array.isArray(value);
}

function safeFileName(name) {
  const base = path.basename(String(name || 'gambar')).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 60);
  return base || 'gambar';
}

async function api(req, res, pathname) {
  if (pathname === '/api/admin/login') {
    if (req.method !== 'POST') {
      send(res, 405, JSON.stringify({ error: 'Method tidak diizinkan' }), MIME['.json']);
      return true;
    }
    try {
      const { password = '' } = JSON.parse(await readBody(req));
      if (!passwordMatches(password)) {
        send(res, 401, JSON.stringify({ error: 'Password admin tidak tepat.' }), MIME['.json']);
        return true;
      }
      const token = crypto.randomBytes(32).toString('base64url');
      sessions.set(token, Date.now() + SESSION_TTL_MS);
      res.setHeader('Set-Cookie', `sdn_admin_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`);
      send(res, 200, JSON.stringify({ ok: true }), MIME['.json']);
    } catch {
      send(res, 400, JSON.stringify({ error: 'Data login tidak valid.' }), MIME['.json']);
    }
    return true;
  }
  if (pathname === '/api/admin/logout') {
    if (req.method !== 'POST') {
      send(res, 405, JSON.stringify({ error: 'Method tidak diizinkan' }), MIME['.json']);
      return true;
    }
    sessions.delete(sessionToken(req));
    res.setHeader('Set-Cookie', 'sdn_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    send(res, 200, JSON.stringify({ ok: true }), MIME['.json']);
    return true;
  }
  if (pathname === '/api/images' && req.method === 'GET') {
    if (!authorised(req)) {
      send(res, 401, JSON.stringify({ error: 'Silakan login sebagai admin terlebih dahulu.' }), MIME['.json']);
      return true;
    }
    try {
      await fsp.mkdir(IMAGES_DIR, { recursive: true });
      const folder = String(new URL(req.url, 'http://localhost').searchParams.get('folder') || 'galeri').replace(/[^a-zA-Z0-9_-]/g, '');
      const dir = path.join(IMAGES_DIR, folder);
      if (dir !== IMAGES_DIR && !dir.startsWith(`${IMAGES_DIR}${path.sep}`)) throw new Error('Folder tidak valid');
      await fsp.mkdir(dir, { recursive: true });
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      const files = entries.filter((entry) => entry.isFile() && MIME[path.extname(entry.name).toLowerCase()]).map((entry) => ({ name: entry.name, url: `/images/${folder}/${entry.name}` }));
      send(res, 200, JSON.stringify({ folder, files }), MIME['.json']);
    } catch (error) {
      send(res, 400, JSON.stringify({ error: error.message || 'Tidak dapat memuat gambar' }), MIME['.json']);
    }
    return true;
  }
  if (pathname === '/api/upload' && req.method === 'POST') {
    if (!authorised(req)) {
      send(res, 401, JSON.stringify({ error: 'Silakan login sebagai admin terlebih dahulu.' }), MIME['.json']);
      return true;
    }
    try {
      const payload = JSON.parse(await readBody(req));
      const folder = String(payload.folder || 'galeri').replace(/[^a-zA-Z0-9_-]/g, '');
      const dir = path.join(IMAGES_DIR, folder);
      if (dir !== IMAGES_DIR && !dir.startsWith(`${IMAGES_DIR}${path.sep}`)) throw new Error('Folder tidak valid');
      if (!IMAGE_FOLDERS.has(folder)) throw new Error('Folder gambar tidak dikenal');
      const dataUrl = String(payload.dataUrl || '');
      const match = dataUrl.match(/^data:image\/(webp|png|jpeg);base64,(.+)$/);
      if (!match) throw new Error('Data gambar tidak valid');
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 25_000_000) throw new Error('Gambar terlalu besar');
      await fsp.mkdir(dir, { recursive: true });
      const name = `${safeFileName(payload.name)}-${Date.now().toString(36)}.${ext}`;
      await fsp.writeFile(path.join(dir, name), buffer);
      send(res, 200, JSON.stringify({ ok: true, url: `/images/${folder}/${name}`, name }), MIME['.json']);
    } catch (error) {
      send(res, 400, JSON.stringify({ error: error.message || 'Gagal mengunggah gambar' }), MIME['.json']);
    }
    return true;
  }
  if (pathname === '/api/image/delete' && req.method === 'POST') {
    if (!authorised(req)) {
      send(res, 401, JSON.stringify({ error: 'Silakan login sebagai admin terlebih dahulu.' }), MIME['.json']);
      return true;
    }
    try {
      const payload = JSON.parse(await readBody(req));
      const folder = String(payload.folder || '').replace(/[^a-zA-Z0-9_-]/g, '');
      const name = path.basename(String(payload.name || ''));
      const dir = path.join(IMAGES_DIR, folder);
      if (dir !== IMAGES_DIR && !dir.startsWith(`${IMAGES_DIR}${path.sep}`)) throw new Error('Folder tidak valid');
      if (!IMAGE_FOLDERS.has(folder) || !name) throw new Error('Gambar tidak dikenal');
      const target = path.join(dir, name);
      if (!target.startsWith(`${dir}${path.sep}`)) throw new Error('Nama file tidak valid');
      await fsp.unlink(target);
      send(res, 200, JSON.stringify({ ok: true }), MIME['.json']);
    } catch (error) {
      send(res, 400, JSON.stringify({ error: error.message || 'Gagal menghapus gambar' }), MIME['.json']);
    }
    return true;
  }
  if (pathname === '/api/admin/backup' && req.method === 'POST') {
    if (!authorised(req)) {
      send(res, 401, JSON.stringify({ error: 'Silakan login sebagai admin terlebih dahulu.' }), MIME['.json']);
      return true;
    }
    try {
      const name = await createBackup();
      send(res, 200, JSON.stringify({ ok: true, name }), MIME['.json']);
    } catch (error) {
      send(res, 400, JSON.stringify({ error: error.message || 'Gagal membuat backup' }), MIME['.json']);
    }
    return true;
  }
  if (pathname === '/api/admin/backups' && req.method === 'GET') {
    if (!authorised(req)) {
      send(res, 401, JSON.stringify({ error: 'Silakan login sebagai admin terlebih dahulu.' }), MIME['.json']);
      return true;
    }
    try {
      const files = await listBackups();
      send(res, 200, JSON.stringify({ ok: true, files }), MIME['.json']);
    } catch (error) {
      send(res, 400, JSON.stringify({ error: error.message || 'Tidak dapat membaca daftar backup' }), MIME['.json']);
    }
    return true;
  }
  if (pathname === '/api/admin/restore' && req.method === 'POST') {
    if (!authorised(req)) {
      send(res, 401, JSON.stringify({ error: 'Silakan login sebagai admin terlebih dahulu.' }), MIME['.json']);
      return true;
    }
    try {
      const payload = JSON.parse(await readBody(req));
      const name = path.basename(String(payload.file || ''));
      if (!name.startsWith(BACKUP_PREFIX) || !name.endsWith('.json')) throw new Error('Nama backup tidak valid.');
      const snapshot = JSON.parse(await fsp.readFile(path.join(BACKUP_DIR, name), 'utf8'));
      if (!snapshot || typeof snapshot.files !== 'object') throw new Error('Isi file backup tidak valid.');
      let restored = 0;
      for (const [basename, value] of Object.entries(snapshot.files)) {
        const target = DATA_BASENAMES[basename];
        if (!target) continue;
        if (basename === 'site.json' && !validContent(value)) throw new Error('Isi site.json pada backup tidak valid.');
        const tempFile = `${target}.${process.pid}.restore.tmp`;
        await fsp.writeFile(tempFile, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
        await fsp.rename(tempFile, target);
        restored += 1;
      }
      if (!restored) throw new Error('Tidak ada data yang dapat dipulihkan dari backup ini.');
      send(res, 200, JSON.stringify({ ok: true, restored, message: `Data dipulihkan dari ${name}.` }), MIME['.json']);
    } catch (error) {
      send(res, 400, JSON.stringify({ error: error.message || 'Gagal memulihkan data' }), MIME['.json']);
    }
    return true;
  }
  const dataFile = DATA_FILES[pathname];
  if (!dataFile) return false;
  if (req.method === 'GET') {
    const content = await fsp.readFile(dataFile, 'utf8');
    send(res, 200, content, MIME['.json']);
    return true;
  }
  if (req.method !== 'PUT') {
    send(res, 405, JSON.stringify({ error: 'Method tidak diizinkan' }), MIME['.json']);
    return true;
  }
  if (!authorised(req)) {
    send(res, 401, JSON.stringify({ error: 'Silakan login sebagai admin terlebih dahulu.' }), MIME['.json']);
    return true;
  }
  try {
    const content = JSON.parse(await readBody(req));
    if (!validData(content, pathname)) throw new Error('Struktur data tidak valid');
    const tempFile = `${dataFile}.${process.pid}.tmp`;
    await fsp.writeFile(tempFile, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
    await fsp.rename(tempFile, dataFile);
    send(res, 200, JSON.stringify({ ok: true, message: 'Konten berhasil disimpan.' }), MIME['.json']);
  } catch (error) {
    send(res, 400, JSON.stringify({ error: error.message || 'Data tidak dapat disimpan' }), MIME['.json']);
  }
  return true;
}

async function serveStatic(req, res, pathname) {
  if (pathname === '/admin/dashboard' || pathname === '/admin/dashboard/' || pathname === '/admin.html') {
    if (!sessionAuthorised(req)) {
      res.writeHead(302, { Location: '/admin', 'Cache-Control': 'no-store' });
      res.end();
      return;
    }
    pathname = '/admin/dashboard';
  }
  const routes = {
    '/': 'index.html',
    '/admin': 'admin-login.html',
    '/admin/': 'admin-login.html',
    '/admin/dashboard': 'admin.html',
    '/ekstrakurikuler': 'ekstrakurikuler.html',
    '/album': 'album.html',
    '/prestasi': 'prestasi.html',
    '/berita': 'berita.html',
    '/video': 'video.html'
  };
  const requested = routes[pathname] || pathname.slice(1);
  const filePath = path.resolve(ROOT, requested || 'index.html');
  const blockedSegment = path.relative(ROOT, filePath).split(path.sep).some(function (segment) {
    return segment === '.git' || segment === 'mentahan' || segment === 'pre' || segment === 'data' || segment === 'backups' || segment.startsWith('.');
  });
  if (blockedSegment || !filePath.startsWith(`${ROOT}${path.sep}`) || path.extname(filePath) === '.json') {
    send(res, 403, 'Akses ditolak.');
    return;
  }
  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) throw new Error('Bukan file');
    send(res, 200, await fsp.readFile(filePath), MIME[path.extname(filePath)] || 'application/octet-stream');
  } catch {
    send(res, 404, 'Halaman tidak ditemukan.');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
    if (!(await api(req, res, pathname))) await serveStatic(req, res, pathname);
  } catch (error) {
    console.error(error);
    send(res, 500, 'Terjadi kesalahan pada server.');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`SDN 3 Ngrayun berjalan di http://localhost:${PORT}`);
  console.log(`Akses LAN: http://<IP-komputer>:${PORT}`);
  if (!ADMIN_PASSWORD) console.warn('ADMIN_PASSWORD belum diatur. Dashboard hanya dapat dibaca, tidak dapat menyimpan.');
});
