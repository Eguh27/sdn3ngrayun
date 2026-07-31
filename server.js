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
  '/api/ekstrakurikuler': path.join(ROOT, 'data', 'ekstrakurikuler.json')
};
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 4147);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();
const MIME = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

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
    if (body.length > 150_000) throw new Error('Payload terlalu besar');
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
    '/prestasi': 'prestasi.html'
  };
  const requested = routes[pathname] || pathname.slice(1);
  const filePath = path.resolve(ROOT, requested || 'index.html');
  if (!filePath.startsWith(`${ROOT}${path.sep}`) || path.extname(filePath) === '.json') {
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
