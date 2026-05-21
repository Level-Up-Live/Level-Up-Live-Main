# Level Up Live – Website

Static site for Level Up Live. Ready for **GitHub Pages**.

## Publish on GitHub Pages

1. Create a new repository on GitHub (e.g. `yourusername/level-up-live`).
2. In the project folder, initialize git (if not already) and add the remote:
   ```bash
   git init
   git add .
   git commit -m "Initial commit – Level Up Live site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main** → Folder: **/ (root)** → Save.
4. The site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/` after a minute or two.

## Notes

- **`.nojekyll`** is included so GitHub does not run Jekyll (keeps all files and paths as-is).
- **Image names** use lowercase and hyphens only so they work reliably on all hosts and case-sensitive systems.

## Sync Events from Private Google Sheet

This site can load the tournaments/events list from `content/data/events.json`.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root (copy `.env.example`).
3. Fill in your service account values:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (with `\n` newlines)
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SHEET_TAB` (default: `Events`)
4. Pull latest rows from Google Sheets:
   ```bash
   npm run sync:events
   ```
5. Deploy as normal. The page `/upcoming-tournaments` reads from `content/data/events.json`.

**Google Sheet (tournaments/events):**  
https://docs.google.com/spreadsheets/d/17-WseYQsQlNPghWKPdyLc2Px3xED6qnxuPI1R4uMvHs/edit  
Current synced tab in the repo is usually **`Sheet1`** (see `generated_at` / `tab` in `events.json`).

### Automatic sync (GitHub Actions)

Workflow `.github/workflows/sync-events.yml` runs every **2 hours** and can be triggered manually under **Actions → Sync tournaments from Google Sheet → Run workflow**.

Add these **repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
|--------|--------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email (see `.env.example`) |
| `GOOGLE_PRIVATE_KEY` | Full private key, including `-----BEGIN...` / `-----END...` (paste with real newlines or `\n`) |
| `GOOGLE_SHEET_ID` | `17-WseYQsQlNPghWKPdyLc2Px3xED6qnxuPI1R4uMvHs` |
| `GOOGLE_SHEET_TAB` | Your tab name, e.g. `Sheet1` or `Events` |

Share the spreadsheet with the service account email (Viewer is enough). After secrets are set, sheet edits show on the site within about **2 hours** (sync) plus **1–3 minutes** (Vercel deploy on push).
