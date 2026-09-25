# 🚀 RecoverAI — Cloud Deployment Guide

This guide explains how to deploy **RecoverAI** (FastAPI Backend + React Vite Frontend) to the cloud for free.

---

## 🏗️ Architecture Overview

| Component | Technology | Recommended Host | Free Tier Available? |
|---|---|---|:---:|
| **Frontend** | React 18 + Vite + Tailwind | **Vercel** or **Netlify** | ✅ Yes (100% Free) |
| **Backend** | Python 3.11 + FastAPI + ML | **Render** or **Railway** | ✅ Yes (Free Web Service) |

---

## 📦 Step 1: Deploy Backend to Render (5 Minutes)

1. Go to [Render.com](https://render.com) and sign in with your GitHub account.
2. Click **"New +"** $\to$ **"Web Service"**.
3. Select your repository: `Premanshu-Kumar/Revenue-Recovery`.
4. Configure the settings:
   - **Name**: `recoverai-backend`
   - **Language**: `Python 3`
   - **Region**: `Oregon (US West)` or your closest region
   - **Branch**: `main`
   - **Root Directory**: Leave blank (or `backend`)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Click **"Create Web Service"**.
6. Once deployed, Render will provide your public URL (e.g. `https://recoverai-backend.onrender.com`).
   - Test it by visiting: `https://recoverai-backend.onrender.com/docs`

---

## 🎨 Step 2: Deploy Frontend to Vercel or Netlify (3 Minutes)

### Option A: Deploy on Vercel (Recommended)

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **"Add New..."** $\to$ **"Project"**.
3. Import your repository: `Premanshu-Kumar/Revenue-Recovery`.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `frontend` (or leave default since `vercel.json` is configured).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://<your-render-backend-url>/api` *(e.g. `https://recoverai-backend.onrender.com/api`)*
6. Click **"Deploy"**.
7. In ~60 seconds, your site will be live at `https://your-project.vercel.app`!

---

### Option B: Deploy on Netlify

1. Go to [Netlify.com](https://netlify.com) and sign in with GitHub.
2. Click **"Add new site"** $\to$ **"Import an existing project"**.
3. Select `Premanshu-Kumar/Revenue-Recovery`.
4. The pre-configured `netlify.toml` will automatically set:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Under **Environment variables**, add:
   - `VITE_API_URL` = `https://<your-render-backend-url>/api`
6. Click **"Deploy Site"**.

---

## 🔒 CORS & Security
The backend is already pre-configured with `CORSMiddleware` (`allow_origins=["*"]`), so your Vercel/Netlify frontend will be able to make API requests immediately without cross-origin errors.
