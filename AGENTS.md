# AGENTS.md

SDN 3 Ngrayun — static school website (SD Negeri 3 Ngrayun, Ponorogo) with a small Node.js admin backend.

## Stack & constraints
- Zero-dependency Node.js (`server.js`) + vanilla HTML/CSS/JS. No `package.json`, no npm, no framework, no build step — do NOT introduce dependencies.
- Requires Node 20+. Start with `node server.js` (default port 4147, override via `PORT`). Replit uses `PORT=5000` (see `.replit`).
- All UI copy, error messages, and docs are in Indonesian — keep new UI strings and data in Indonesian.
- `js/` files are ES5-style IIFEs (`(function () { 'use strict'; })()` with `var`) — match this style.
- No test/lint tooling exists. Verify with `node --check js/*.js server.js`, then run the server and hit pages/APIs manually.

## Layout
- Root HTML pages are routed by `server.js` (`/`, `/admin`, `/admin/dashboard`, `/ekstrakurikuler`, `/album`, `/prestasi`, `/berita`, `/video`). `admin.html` redirects to `/admin` without a valid session cookie — test auth via curl with the session cookie.
- `js/content.js` renders public pages; `js/admin.js` drives the dashboard; `js/berita.js` renders the news detail view (`berita.html?id=N`); `js/detail-card.js` is an event-delegated gallery modal that only runs if `<dialog>` is supported (works for dynamically added cards).
- `data/*.json` are the source of truth, edited only via admin PUT endpoints. `site.json` must match shape `{ school, content }` — the server rejects malformed data.
- `images/<folder>` uses exactly four folders: `profil`, `galeri`, `ekskul`, `prestasi`. Image URLs in JSON must reference files that exist there.
- `mentahan/` is raw source material/backups (huge photos, an old `admin.html`) — never edit or reference it. `pre/` holds design docs; `replit.md` is the canonical run guide.

## Admin/auth gotchas
- `ADMIN_PASSWORD` env var is required for writes; when unset the server warns and all PUTs return 401 (dashboard is read-only).
- Auth is the `sdn_admin_session` cookie (8h TTL) or HTTP Basic. JSON writes are atomic (temp file + rename). `node --check` won't catch auth issues.
- Uploads arrive as base64 `data:image/(webp|png|jpeg)` JSON, max 25MB, converted to WebP client-side; only the four folders above are accepted.
- In `site.json`, `content.galleryInfo` uses 6 fixed keys (`learning`, `ceremony`, `scouts`, `achievements`, `environment`, `specialDay`) plus `content.galleryOrder` — keep these keys consistent when adding gallery slots.
