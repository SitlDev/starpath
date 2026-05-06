# 🚀 Quick Start: Deploy StarPath to Railway in 10 Minutes

> **Prerequisites:** GitHub account, Railway account (free), project pushed to GitHub

---

## Step 1: Create Railway Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account
5. Select your StarPath repository

---

## Step 2: Deploy Backend
1. Railway will prompt for folder selection
2. Select `starpath-backend/`
3. Railway auto-detects Dockerfile ✅
4. Click "Deploy"
5. Wait ~2-3 minutes for deployment

---

## Step 3: Add PostgreSQL
1. In Railway dashboard, click "Add Service"
2. Select "Database" → "PostgreSQL"
3. Railway creates it and auto-sets `DATABASE_URL` ✅
4. Status should show green ✅

---

## Step 4: Run Database Migration
1. Click Backend service → Deployments
2. Click the latest deployment
3. Click "View Logs" to confirm running
4. Open Railway shell:
   ```bash
   railway shell
   ```
5. Run migration:
   ```bash
   alembic upgrade head
   ```
6. Exit: `exit`

---

## Step 5: Add Redis (Optional)
1. Click "Add Service"
2. Select "Database" → "Redis"
3. Railway sets `REDIS_URL` automatically ✅

---

## Step 6: Configure Backend Variables
Backend service → Variables → Add:

```env
CMS_MOCK_MODE=True
SECRET_KEY=your-secret-key-change-this
CMS_ENABLED=True
```

---

## Step 7: Deploy Frontend
1. Click "Add Service"
2. Select "GitHub Repo"
3. Select your repository again
4. Set Dockerfile path: `starpath-frontend/Dockerfile`
5. Click "Deploy"
6. Wait ~2-3 minutes

---

## Step 8: Get Backend URL
1. Backend service → Settings
2. Copy the public URL
3. Example: `https://starpath-backend-production.railway.app`

---

## Step 9: Configure Frontend Variables
Frontend service → Variables → Add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url-from-step-8
```

Replace with actual backend URL!

---

## Step 10: Verify Deployment ✅

**Backend Health:**
```bash
curl https://your-backend-url/health
```
Should return: `{"status": "healthy"}`

**Frontend:**
1. Open frontend URL in browser
2. Should see login page
3. Try logging in with: `admin@starpath.com` / `admin123`
4. Should see dashboard
5. Click "CMS Export" in sidebar
6. Should see CMS dashboard ✅

---

## 🎉 Done!

Your StarPath SNF is now live on Railway:

- ✅ Backend API at `https://your-backend-url`
- ✅ Frontend at `https://your-frontend-url`
- ✅ PostgreSQL database connected
- ✅ Auto-deploying on git push
- ✅ SSL/HTTPS enabled
- ✅ Logs available in Railway dashboard

---

## 📊 Current Costs (Railway Free Tier)
- Backend: $0 (512MB free)
- Frontend: $0 (512MB free)
- PostgreSQL: $0 (1GB free)
- **Total: $0/month** 🎉

Upgrade only if you need more resources.

---

## 🆘 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| 502 Bad Gateway | Backend not running. Check logs. |
| Frontend shows 404 | `NEXT_PUBLIC_API_URL` not set. Update variable. |
| DB connection error | Check `DATABASE_URL` in backend variables. |
| Build fails | Check Dockerfile syntax. Review logs. |
| Can't login | Ensure migration ran. Check logs. |

---

## 📚 Need More Info?

See **RAILWAY_DEPLOYMENT.md** for complete step-by-step guide with all options.

---

*Estimated time: 10 minutes | Cost: $0 (free tier)*
