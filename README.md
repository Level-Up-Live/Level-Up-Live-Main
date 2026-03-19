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
5. Deploy as normal. The page `upcoming-tournaments.html` reads from `content/data/events.json`.
