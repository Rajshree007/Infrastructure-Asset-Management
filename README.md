# Infrastructure Asset Management System

A comprehensive, state-of-the-art Web Application for managing government infrastructure assets, projects, defects, inspections, and budgets. Built with a modern tech stack to provide an intuitive, asset-centric command center.

## 🌟 Key Features

* **Role-Based Access Control (RBAC)**: Secure multi-tier access tailored for:
  * **System Admin**: Full access across all districts and features.
  * **Municipal Commissioner**: Sandboxed view restricted exclusively to their assigned city's assets and metrics.
  * **Reviewer**: Read-only access for auditing and overview.
* **Infrastructure Command Center**: Interactive dashboards with real-time KPIs, condition distributions, and priority alerts.
* **GIS Mapping Integration**: Interactive maps plotting assets by condition, priority, and type across the state.
* **Asset 360° View**: Detailed lifecycle tracking for every asset, including related work orders, defects, and inspections.
* **Priority Center**: Automated risk scoring and backlog tracking to prioritize critical maintenance.
* **Financial Oversight**: Real-time tracking of allocated budgets vs. utilized funds.

## 🛠️ Technology Stack

### Frontend
* **Framework**: React 18 with Vite
* **Language**: TypeScript
* **Styling**: Tailwind CSS (Custom government-themed design system)
* **Routing**: React Router DOM v6
* **Charts**: Recharts
* **Maps**: Leaflet (react-leaflet)
* **Icons**: Lucide React

### Backend
* **Runtime**: Node.js
* **Framework**: Express.js
* **Language**: TypeScript
* **Security**: Helmet, CORS, Express Rate Limit, bcryptjs
* **Authentication**: JSON Web Tokens (JWT)

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js (v18 or higher)
* npm (v9 or higher)

### 1. Setup the Backend
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Run development server
npm run dev
```
The backend will run on `http://localhost:3001`

### 2. Setup the Frontend
```bash
cd frontend
npm install

# Create environment file
cp .env.example .env

# Run development server
npm run dev
```
The frontend will run on `http://localhost:5173`

## 🌍 Deployment

### Backend (Render)
The backend is configured for deployment on Render. 
1. Create a **Web Service** on Render pointing to your repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Start Command** to `npm start`.
5. Add `JWT_SECRET` and `NODE_ENV=production` as Environment Variables.

### Frontend (Vercel)
The frontend is configured for deployment on Vercel (`vercel.json` included for SPA routing).
1. Import the repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Add `VITE_API_URL` pointing to your deployed Render backend URL (e.g., `https://your-backend.onrender.com/api`).
4. Deploy.

## 🔒 Default Accounts

You can log into the system using the following preset roles:

* **Admin**: `admin@infragov.in` (Password: `admin123`)
* **Municipal Commissioner**: `commissioner@infragov.in` (Password: `comm123`) - *Requires selecting a City during login*
* **Reviewer**: `reviewer@infragov.in` (Password: `view123`)

## 📄 License
This project was developed for Hackathon submission. All rights reserved.
