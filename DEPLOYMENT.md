# Deployment steps – Seeking Beauty App

## Deploy the Next.js app (Vercel)

Your app is set up to deploy from GitHub to Vercel. Use these steps whenever you want to ship changes.

### 1. Commit and push your changes

```bash
# From the project root
cd /Users/sherijennings/Documents/seeking-beauty-app

# See what’s changed
git status

# Stage everything you want to deploy (or specific files)
git add .
# Or: git add app/ components/ public/ lib/ ...

# Commit with a short message
git commit -m "Describe your change (e.g. Pray page: dots + Next, swipe fix)"

# Push to the branch Vercel watches (usually main)
git push origin main
```

### 2. Let Vercel build and deploy

- Vercel will start a new deployment when it sees the push to `main`.
- Open **[Vercel Dashboard](https://vercel.com/dashboard)** → your project → **Deployments**.
- Wait for the latest deployment to show **Ready** (typically 1–3 minutes).
- Your live site (e.g. `s-beauty-app.vercel.app`) will then serve the new version.

### 3. (Optional) Check the build locally first

```bash
npm run build
```

If this fails, fix the errors before pushing so Vercel doesn’t deploy a broken build.

---

## One-time setup (if the project isn’t connected yet)

### Connect the repo to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New…** → **Project**.
3. Import the GitHub repo (e.g. `srjennings-luna/s-beauty-app`).
4. Leave **Framework Preset** as **Next.js** and **Root Directory** as `.` unless you changed the layout.
5. Click **Deploy**. Vercel will build and give you a URL (e.g. `s-beauty-app.vercel.app`).

### Environment variables (if you add any later)

If you introduce env vars (e.g. `NEXT_PUBLIC_SANITY_PROJECT_ID`):

1. In Vercel: Project → **Settings** → **Environment Variables**.
2. Add each variable for **Production** (and **Preview** if you want them on PR previews).
3. Redeploy (e.g. push a small commit or use **Redeploy** in the Deployments tab) so the new variables are used.

---

## Sanity Studio (content backend)

- The **Next.js app** (this repo) is what you deploy to Vercel; it already talks to Sanity using the project id in `lib/sanity.ts`.
- If you host **Sanity Studio** (the `sanity/` folder) somewhere (e.g. sanity.io or a separate Vercel project), deploy that separately using Sanity’s or Vercel’s docs. Pushing this repo only updates the main Seeking Beauty app, not the Studio.

---

## Quick reference

| Goal                         | Command / action                          |
|-----------------------------|--------------------------------------------|
| Deploy latest code          | `git add .` → `git commit -m "..."` → `git push origin main` |
| Test build locally          | `npm run build`                            |
| Run app locally             | `npm run dev` → open http://localhost:3000  |
| See deployment status       | Vercel Dashboard → Project → Deployments   |
