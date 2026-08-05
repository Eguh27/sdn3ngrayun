#!/usr/bin/env node

/*
 * Alat backup & pemulihan data SDN 3 Ngrayun (tanpa dependency).
 *
 * Pemakaian:
 *   node backup.js              -> buat backup semua data/ ke folder backups/
 *   node backup.js --list       -> tampilkan daftar backup yang ada
 *   node backup.js --restore <file>  -> pulihkan data dari backups/<file>
 */

'use strict';

const fsp = require('node:fs/promises');
const path = require('node:path');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const BACKUP_DIR = path.join(ROOT, 'backups');
const DATA_NAMES = ['site.json', 'prestasi.json', 'ekstrakurikuler.json', 'news.json', 'videos.json'];
const BACKUP_PREFIX = 'sdn3ngrayun-backup-';

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function createBackup() {
  await fsp.mkdir(BACKUP_DIR, { recursive: true });
  const snapshot = { createdAt: new Date().toISOString(), files: {} };
  for (const name of DATA_NAMES) {
    try {
      snapshot.files[name] = JSON.parse(await fsp.readFile(path.join(DATA_DIR, name), 'utf8'));
    } catch (error) {
      console.warn(`Lewati ${name}: ${error.message}`);
    }
  }
  if (!Object.keys(snapshot.files).length) {
    throw new Error('Tidak ada file data yang dapat di-backup.');
  }
  const file = path.join(BACKUP_DIR, `${BACKUP_PREFIX}${stamp()}.json`);
  await fsp.writeFile(file, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  return file;
}

async function listBackups() {
  await fsp.mkdir(BACKUP_DIR, { recursive: true });
  const entries = await fsp.readdir(BACKUP_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));
  if (!files.length) {
    console.log('Belum ada backup.');
    return;
  }
  for (const entry of files.sort((a, b) => b.name.localeCompare(a.name))) {
    const stat = await fsp.stat(path.join(BACKUP_DIR, entry.name));
    console.log(`${entry.name}  (${stat.size} byte)`);
  }
}

async function restore(name) {
  const safeName = path.basename(String(name || ''));
  if (!safeName.startsWith(BACKUP_PREFIX) || !safeName.endsWith('.json')) {
    throw new Error('Nama file backup tidak valid.');
  }
  const source = path.join(BACKUP_DIR, safeName);
  const snapshot = JSON.parse(await fsp.readFile(source, 'utf8'));
  if (!snapshot || typeof snapshot.files !== 'object') {
    throw new Error('Isi file backup tidak valid.');
  }
  let restored = 0;
  for (const [fileName, value] of Object.entries(snapshot.files)) {
    if (DATA_NAMES.indexOf(fileName) === -1) continue;
    const target = path.join(DATA_DIR, fileName);
    const tempFile = `${target}.restore.tmp`;
    await fsp.writeFile(tempFile, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await fsp.rename(tempFile, target);
    restored += 1;
    console.log(`Dipulihkan: data/${fileName}`);
  }
  if (!restored) throw new Error('Tidak ada data yang dapat dipulihkan dari backup ini.');
  console.log(`Selesai. ${restored} file dipulihkan dari ${safeName}.`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--list') {
    await listBackups();
  } else if (args[0] === '--restore') {
    await restore(args[1]);
  } else {
    const file = await createBackup();
    console.log(`Backup dibuat: ${file}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
