# Publishing to KnotStranded.com (Subdomain)

To host your new Viral Media Intelligence portal as a subdomain (e.g., `intel.knotstranded.com`) while keeping your primary site on Squarespace, follow this professional deployment workflow.

## 1. Hosting the Backend (Flask + React)
Squarespace does not natively host Python/Flask applications. You should host this repository on a cloud platform that supports Python.

### Option A: Railway (Recommended for this project)
1. **Connect GitHub**: Connect this repository to Railway.
2. **Automatic Configuration**: I have provided a `railway.json` and a `Dockerfile`. Railway will detect these and automatically use the **Docker Builder**.
3. **Multi-Stage Build**: The deployment will:
   - Build your React frontend using Node 20.
   - Package the built files into a Python 3.11 environment.
   - Serve everything via Gunicorn.
4. **Environment Variables**: In the Railway "Variables" tab, add your API keys:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
5. **Static Assets**: Ensure you check the "Service Role" or similar settings if Railway has trouble finding files, but the `Dockerfile` handles this by default.

## 2. Setting Up the Subdomain on Squarespace
Once your app is live on a host (e.g., `knotstranded-portal.onrender.com`), you need to point your Squarespace subdomain to it.

1. **Log in to Squarespace**: Go to **Settings > Domains**.
2. **Select your Domain**: Click on `knotstranded.com`.
3. **Advanced Settings**: Select **DNS Settings**.
4. **Add a CNAME Record**:
   - **Host**: `intel` (or your preferred subdomain)
   - **Type**: `CNAME`
   - **Alias Data**: `knotstranded-portal.onrender.com` (Your Render URL)

## 3. Deployment via Existing Pipeline
You mentioned already having a frontend/backend team. You can simply:
1. **Containerize**: Use a `Dockerfile` to wrap this Flask app.
2. **Deploy**: Push to your existing AWS/Google Cloud/Heroku infrastructure.
3. **DNS**: Point the `knotstranded.com` subdomain to that infrastructure's load balancer or IP.

## 4. Why a Subdomain is Better
*   **Separation of Concerns**: Your main marketing site stays on Squarespace's stable builder.
*   **Technical Freedom**: Your high-performance Viral Portal runs on dedicated compute power, allowing for fast AI generation and dynamic news tickers.
*   **SEO Boost**: Search engines treat subdomains as related entities, sharing the "authority" of the main `knotstranded.com` domain.

---
**Status**: The codebase is now fully optimized with the "Viral Media Intelligence" aesthetic and is ready for production deployment.
gif