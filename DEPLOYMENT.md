# Deployment Guide

The R&B InfraGov platform is a modern decoupled application (Vite React frontend + Express TypeScript backend). It can be easily deployed to platforms like **Render**, **Vercel**, or **Railway**.

## Option 1: Deploy to Render (Recommended)

Render is the easiest platform for this stack because it can host both the Node.js backend and the React frontend static site. We've included a `render.yaml` Blueprint file for one-click deployment.

### Steps
1. Push this repository to GitHub.
2. Create an account on [Render](https://render.com/).
3. In the Render Dashboard, click **New +** and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` file and deploy two services:
   - `rbinfragov-backend` (Node.js API)
   - `rbinfragov-frontend` (Static Site)
6. Once deployed, the frontend will automatically route API requests to your new backend URL via the injected environment variables.

---

## Option 2: Frontend on Vercel + Backend on Render/Railway

For the fastest global CDN performance for the frontend, Vercel is the industry standard.

### Step 1: Deploy the Backend
Deploy the `backend` folder to a service like Render (Web Service), Railway, or Heroku.
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Ensure you set `NODE_ENV=production`.
- **Copy the deployed backend URL** (e.g., `https://my-backend.onrender.com`).

### Step 2: Deploy the Frontend to Vercel
1. Create a [Vercel](https://vercel.com/) account and click **Add New Project**.
2. Connect your GitHub repository.
3. In the **Framework Preset** dropdown, Vercel will automatically detect **Vite**.
4. In the **Root Directory** setting, click Edit and select `frontend`.
5. In **Environment Variables**, add:
   - Name: `VITE_API_URL`
   - Value: `https://my-backend.onrender.com/api/v1` (replace with your backend URL from Step 1).
6. Click **Deploy**.

---

## Local Production Build Test

To verify the production build locally before deploying:

**1. Build the Backend**
```bash
cd backend
npm install
npm run build
npm start
```
*(The backend runs on http://localhost:5000)*

**2. Build the Frontend**
```bash
cd frontend
npm install
npm run build
npm run preview
```
*(The preview server runs on http://localhost:4173)*
