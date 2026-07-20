# BDA Team Performance Dashboard

A live, shared dashboard for the Business Development team's Q3 SQL/MQL progress. Meant to be broadcast on an office TV and also shared as a link so anyone on the team can check current standings.

Unlike the earlier single-file version, this one has a small server, so **everyone who opens the link sees the same live numbers** — updates made through "Update SQLs" are saved centrally, not just in one browser.

## What's included

- `server.js` — a tiny Express server. Serves the dashboard and a simple API (`GET /api/data`, `POST /api/data`, `POST /api/reset`) backed by a JSON file on disk.
- `index.html` — the dashboard itself (pie chart of % to goal per rep, vertical breakdown, leaderboard, edit modal).
- `seed-data.json` — the starting Q3 numbers. Used to initialize `data.json` the first time the server runs, and restored by the "Reset to Defaults" button.
- `data.json` — created automatically on first run; holds the live, current numbers. Not committed to git (see `.gitignore`) so your seed data always represents the starting point.

## Run it locally (optional, to test before deploying)

```
cd bda-dashboard
npm install
npm start
```

Then open `http://localhost:3000`.

## Push to GitHub

1. Create a new repository on GitHub (github.com → New repository). Keep it private if you'd rather your team's SQL numbers not be public.
2. From inside this `bda-dashboard` folder:

```
git init
git add .
git commit -m "BDA team performance dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in (a GitHub login is easiest since you're already using GitHub).
2. Click **New Project → Deploy from GitHub repo**, and pick the repo you just pushed.
3. Railway auto-detects this as a Node app (via `package.json`) and runs `npm install` then `npm start` automatically — no config needed.
4. Once it's deployed, go to the service's **Settings → Networking** and click **Generate Domain**. That gives you a public URL like `bda-dashboard-production.up.railway.app`.
5. Share that URL with your team and point the office TV's browser at it (fullscreen/kiosk mode).

## Updating the numbers going forward

Anyone with the link can view it; use the **⚙ Update SQLs** button (on whichever device you use to manage it) to update current SQL/MQL counts, goals, rep names, or toggle a rep inactive (e.g. once Dan G leaves). Saves go to the server, so the TV and everyone else's browser will pick up the change on their next refresh (the page also auto-refreshes every 20 seconds).

## A couple of things worth knowing

- **Data persistence across redeploys:** `data.json` lives on Railway's container filesystem. If you redeploy (e.g. push new code), Railway rebuilds the container and `data.json` resets to the seed values. For a "set it and update it in place" tool like this, that's usually fine — but if you want the numbers to survive redeploys, ask me to wire up a Railway volume or a small database instead.
- **No login/authentication:** anyone with the link can open **Update SQLs** and change numbers. That's fine for an internal team tool, but let me know if you'd like a simple PIN/password gate on the edit modal.
