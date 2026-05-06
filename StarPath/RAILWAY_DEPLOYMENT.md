# 🚀 Railway Deployment Guide - StarPath SNF

## ✅ Pre-Deployment Checklist

- [x] Docker files created (backend & frontend)
- [x] Environment variables configured
- [x] Database migrations ready
- [x] All code compiled and tested
- [x] Rate limiting implemented
- [x] CMS integration complete

---

## 📋 Step-by-Step Railway Deployment

### 1️⃣ Prerequisites

- [Railway.app account](https://railway.app) (free tier available)
- GitHub account
- Project code pushed to GitHub

### 2️⃣ Create Railway Project

**Option A: Deploy from GitHub (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize and select your repository
5. Choose `starpath-backend` folder first

**Option B: Deploy with Railway CLI**
```bash
npm i -g @railway/cli
railway login
railway init
```

---

### 3️⃣ Configure Backend Service

#### A. Deploy Backend Docker Image
1. In Railway dashboard, click "Add Service"
2. Select "Docker"
3. Connect to your GitHub repo (if not already)
4. Set Dockerfile path: `starpath-backend/Dockerfile`
5. Set deployment trigger: On push to `main` (or your branch)

#### B. Add PostgreSQL Database
1. Click "Add Service" → "Database" → "PostgreSQL"
2. Railway creates it automatically
3. Environment variables set automatically:
   - `DATABASE_URL` (format: `postgresql://user:password@host:port/dbname`)

#### C. Add Redis Cache
1. Click "Add Service" → "Database" → "Redis"
2. Environment variables set automatically:
   - `REDIS_URL` (format: `redis://:password@host:port`)

#### D. Configure Backend Environment Variables
In Railway dashboard, go to Backend service settings → Variables:

```env
DATABASE_URL=${DATABASE_URL}  # Auto-populated
REDIS_URL=${REDIS_URL}        # Auto-populated

# CMS Configuration
CMS_ENABLED=True
CMS_API_BASE_URL=https://api.cms.gov/five-star/v1
CMS_API_KEY=your_api_key_here
CMS_API_SECRET=your_api_secret_here
CMS_MOCK_MODE=False
CMS_TIMEOUT_SECONDS=30
CMS_MAX_RETRIES=3
CMS_RETRY_DELAY_SECONDS=300
CMS_EXPORT_DIR=/tmp/cms_exports
CMS_KEEP_EXPORTS=True

# Rate Limits
RATE_LIMIT_CMS_EXPORTS=100
RATE_LIMIT_CMS_SUBMISSIONS=50

# Server
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=11520
```

#### E. Set Deployment Port
In Railway backend service → Settings → Port Mapping:
- Set to `8000` (matches Dockerfile EXPOSE)

---

### 4️⃣ Run Database Migration

After backend deploys:

1. Open Railway dashboard → Backend service
2. Click "Deployments" → Latest deployment
3. Click "View Logs" to confirm it's running
4. Connect to the running container:
   ```bash
   railway shell
   ```
5. Run migration:
   ```bash
   alembic upgrade head
   ```
6. Exit shell: `exit`

**Alternative: Add to Dockerfile**
Add this before the uvicorn command:
```dockerfile
RUN alembic upgrade head
```

---

### 5️⃣ Deploy Frontend Service

1. Click "Add Service" → "GitHub Repo"
2. Select your repository again
3. Set Dockerfile path: `starpath-frontend/Dockerfile`
4. Create frontend service

#### A. Configure Frontend Environment Variables
In Railway dashboard, go to Frontend service → Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**Important:** Get your backend URL from Railway:
- Go to Backend service → Settings
- Copy the public URL (format: `https://starpath-backend-production.railway.app`)
- Use this for `NEXT_PUBLIC_API_URL`

#### B. Set Deployment Port
Set to `3000` (matches Dockerfile EXPOSE)

---

### 6️⃣ Configure Custom Domains (Optional)

#### For Backend API
1. Backend service → Settings → Domain
2. Connect custom domain (e.g., `api.starpath.example.com`)
3. Update DNS records as Railway instructs
4. Certificate auto-provisioned (Railway uses Let's Encrypt)

#### For Frontend
1. Frontend service → Settings → Domain
2. Connect custom domain (e.g., `app.starpath.example.com`)
3. Certificate auto-provisioned

---

### 7️⃣ Set Up CI/CD Pipeline

**Automatic Deployments on Git Push:**

Railway automatically watches your GitHub repo. Every push to your default branch triggers a rebuild and deployment:

1. Edit code locally
2. Commit and push: `git push origin main`
3. Railway detects changes
4. Rebuilds Docker images
5. Redeploys services
6. View logs in Railway dashboard

**Disable auto-deploy (if needed):**
- Service settings → Deployment trigger → Manual only

---

### 8️⃣ Verify Deployment

```bash
# Check backend health
curl https://your-backend-railway-url/health

# Expected response:
# {"status": "healthy"}

# Check API docs
https://your-backend-railway-url/docs

# Check frontend
https://your-frontend-railway-url

# Test login
# Go to frontend → Login page
# Use: admin@starpath.com / admin123
```

---

### 9️⃣ Monitor and Debug

#### View Logs
1. Railway dashboard → Service → Deployments
2. Click deployment → View Logs
3. Real-time streaming of logs

#### Common Issues

**502 Bad Gateway:**
- Backend not running
- Check logs: Railway → Backend → Deployments → Logs
- Ensure port is 8000 and matches Dockerfile

**Frontend shows 404:**
- `NEXT_PUBLIC_API_URL` not set correctly
- Frontend can't connect to backend
- Update environment variable and redeploy

**Database connection errors:**
- `DATABASE_URL` not auto-populated
- Manually set in environment variables
- Or ensure PostgreSQL service is created first

**Out of memory:**
- Railway free tier: 512MB per service
- If needed, upgrade plan
- Or optimize code/dependencies

#### SSH into Running Container
```bash
railway shell
# You're now in the container
ls -la
python --version
# Exit
exit
```

---

### 🔟 Enable Auto-Scaling (Paid plans)

For production, consider Railway's paid plans:
- **Hobby:** $5/month (single instance)
- **Pro:** $20/month (auto-scaling available)
- **Enterprise:** Custom pricing

To enable auto-scaling on Pro plan:
1. Service → Settings → Scaling
2. Set min/max replicas
3. Set CPU/memory thresholds

---

## 🔐 Security Considerations

### Environment Variables
✅ Never commit `.env` files
✅ Use Railway's encrypted secret management
✅ Rotate `SECRET_KEY` regularly in production
✅ Use strong `CMS_API_KEY` credentials

### HTTPS/SSL
✅ Railway auto-provisions SSL certificates
✅ All traffic encrypted by default
✅ No manual certificate management needed

### Database Access
✅ PostgreSQL only accessible from services in the same project
✅ Use strong password (Railway generates one)
✅ Enable backups (Railway Pro plan)

### Rate Limiting
✅ Implemented in code (100 exports, 50 submissions/hour)
✅ Additional protection via Railway's DDoS protection

---

## 💰 Cost Estimate (Railway)

| Component | Cost | Notes |
|-----------|------|-------|
| Hobby Plan | $5/month | Includes compute |
| PostgreSQL | $0-15/month | Based on storage |
| Redis | $0-5/month | Based on usage |
| **Total** | **~$5-25/month** | Very economical |

Free tier available for testing (~512MB RAM per service).

---

## 📊 Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] Railway account created
- [ ] Backend service deployed from GitHub
- [ ] PostgreSQL service created and connected
- [ ] Redis service created and connected
- [ ] Frontend service deployed from GitHub
- [ ] Environment variables configured for both services
- [ ] Database migration run (`alembic upgrade head`)
- [ ] Health check passed (`/health` endpoint)
- [ ] Frontend can connect to backend
- [ ] Custom domains configured (optional)
- [ ] Logs reviewed and no errors
- [ ] Login test successful

---

## 🚨 Troubleshooting

### Deployment Stuck
```bash
# Check logs
railway logs -f

# Rebuild and redeploy
# Go to Deployment settings, click "Redeploy"
```

### Environment Variables Not Loading
1. Update in Railway dashboard
2. Trigger redeployment
3. Wait ~30 seconds for new pods to start

### Frontend Can't Connect to Backend
```bash
# Check NEXT_PUBLIC_API_URL is set correctly
# Check backend URL is publicly accessible
# Verify in browser console: Network tab → API calls
```

### PostgreSQL Connection Timeout
1. Ensure PostgreSQL service is running
2. Check `DATABASE_URL` format: `postgresql://user:pass@host:5432/db`
3. Verify firewall allows connections

---

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **Railway Community:** https://railway.app/chat
- **GitHub Issues:** Document errors here
- **Status Page:** https://railway.app/status

---

## ✅ Deployment Complete!

Once all checks pass, you have a production-ready StarPath SNF deployment:

- ✅ Backend API running on Railway
- ✅ Frontend running on Railway
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ Auto-scaling available
- ✅ SSL/HTTPS enabled
- ✅ Monitoring and logs
- ✅ CI/CD pipeline active

**Your app is now live and accessible!**

---

*Last Updated: May 6, 2026*
