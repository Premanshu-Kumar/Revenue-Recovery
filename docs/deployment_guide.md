# 🚀 RecoverAI — Cloud Deployment Guide

This repository supports both **Single-App Deployment** (Frontend + Backend unified on 1 service & 1 URL) and **Separated Deployment** (Frontend on Vercel + Backend on Render).

---

## 🏆 Option 1: Deploy as ONE Single App on Render (Recommended)
> **Best if you want 1 account, 1 service, 1 URL, and zero CORS headaches.**

Render supports deploying via the pre-configured multi-stage `Dockerfile`, which builds the React Vite frontend and bundles it directly with the Python FastAPI backend into a single container.

1. Go to **[Render.com](https://render.com)** and log in with GitHub.
2. Click **New +** $\to$ **Web Service**.
3. Select your repository: `Premanshu-Kumar/Revenue-Recovery`.
4. Configure:
   - **Name**: `recoverai`
   - **Environment / Runtime**: `Docker`
   - **Region**: `Oregon (US West)` or your closest region
   - **Branch**: `main`
   - **Instance Type**: **Free**
5. Click **Create Web Service**.
6. Render will automatically build the container and deploy your full platform to a single URL:
   - **Live App**: `https://recoverai.onrender.com`
   - **API Docs**: `https://recoverai.onrender.com/docs`
   - **API Endpoints**: `https://recoverai.onrender.com/api`

---

## ⚡ Option 2: Deploy as ONE App on Railway

1. Go to **[Railway.app](https://railway.app)** and sign in with GitHub.
2. Click **New Project** $\to$ **Deploy from GitHub repo**.
3. Select `Premanshu-Kumar/Revenue-Recovery`.
4. Railway will automatically detect the `Dockerfile` and deploy the unified app.
5. In your service settings under **Networking**, click **Generate Domain** to get your public URL.

---

## 🎨 Option 3: Separated Architecture (Frontend on Vercel + Backend on Render)
> **Best if you want Vercel's global edge CDN speed for the frontend.**

### Part A: Deploy Backend to Render
1. In [Render.com](https://render.com), click **New +** $\to$ **Web Service**.
2. Select `Premanshu-Kumar/Revenue-Recovery`.
3. Choose **Python 3**:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
4. Copy the backend URL (e.g. `https://recoverai-backend.onrender.com`).

### Part B: Deploy Frontend to Vercel
1. In [Vercel.com](https://vercel.com), click **Add New...** $\to$ **Project** $\to$ Import `Premanshu-Kumar/Revenue-Recovery`.
2. Framework Preset: `Vite`
3. Environment Variables:
   - `VITE_API_URL` = `https://<your-render-backend-url>/api`
4. Click **Deploy**.
