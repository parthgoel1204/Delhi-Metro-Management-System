# DMRC Housekeeping Operations Management System 🚇

**🌐 Live Demo:** [https://delhi-metro-management-system-ipt7.vercel.app](https://delhi-metro-management-system-ipt7.vercel.app/)  
**⚙️ Live API:** [https://delhi-metro-management-system.onrender.com/api/health](https://delhi-metro-management-system.onrender.com/api/health)

A comprehensive, role-based dashboard for the Delhi Metro Rail Corporation to manage daily housekeeping tasks, track real-time manpower, and monitor chemical and machinery usage across the metro network.

## 🌟 Key Features

*   **Role-Based Access Control (RBAC):** Distinct dashboards for System Administrators vs. Station Staff.
*   **Station Management:** Dynamic tracking of 10 DMRC stations across all major color lines.
*   **Manpower Logs:** Real-time visibility into staff attendance, shift management, and worker assignments.
*   **Inventory Tracking:** Daily logging of cleaning chemicals and waste collection (dry vs. wet).
*   **Machinery Maintenance:** Status monitoring of station equipment (Active vs. Under Maintenance).
*   **Data Visualization:** Sleek, dynamic charts tracking active staff and maintenance alerts.

## 🛠️ Technology Stack

**Frontend Framework**
*   [React 18](https://reactjs.org/) (TypeScript)
*   [Tailwind CSS](https://tailwindcss.com/) (Custom UI components with native Dark Mode)
*   [Lucide React](https://lucide.dev/) (Icons)
*   [Recharts](https://recharts.org/) (Data Visualization)
*   [Parcel](https://parceljs.org/) (Next-generation bundler)

**Backend Architecture**
*   [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
*   [PostgreSQL](https://www.postgresql.org/) (Primary Database)
*   `node-postgres` (`pg`) (Database Driver)
*   [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcrypt](https://www.npmjs.com/package/bcryptjs) (Authentication)

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
*   Node.js (v18 or higher)
*   A local PostgreSQL database instance

### 2. Database Setup
Create a local Postgres database:
```sql
CREATE DATABASE metro_hms;
```

### 3. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=3001
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgresql://username:password@localhost:5432/metro_hms
```
Run the Database Seeder (creates tables and admin accounts):
```bash
npm run seed
```
Start the local server:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

**Access the application at:** `http://localhost:1234`

### 🔑 Demo Credentials
*   **Admin:** `admin` / `admin123`
*   **Station Staff (Rajiv Chowk):** `staff_rajiv_chowk` / `staff123`

## ☁️ Production Deployment

This project is configured as a Monorepo and is ready for separate frontend/backend deployments.

### Backend (Render / Heroku)
1.  Connect your repository to your host.
2.  Set the Root Directory to **`server`**.
3.  **Build Command:** `npm install && npm run build`
4.  **Start Command:** `npm start`
5.  Set `DATABASE_URL` and `NODE_ENV=production` in the Environment Variables.

### Frontend (Vercel / Netlify)
1.  Connect your repository to your host.
2.  Set the Root Directory to **`client`**.
3.  Vercel will auto-detect **Parcel** for the build and output settings.
4.  Set `BACKEND_URL` in the Environment Variables to point to your live Node.js server (e.g., `https://my-backend.onrender.com/api`).

## 📁 Project Structure

```text
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Headers, Sidebar, Dashboard Grid
│   │   │   └── modules/      # Individual feature cards (Manpower, Waste, etc.)
│   │   ├── pages/            # Full-page routes (Login, Team, Tasks, etc.)
│   │   ├── App.tsx           # React Router Map
│   │   └── index.css         # Tailwind directives
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── middleware/       # JWT Auth verification
│   │   ├── routes/           # API Endpoints (auth, users, manpower, etc.)
│   │   ├── db.ts             # Postgres connection and table definitions
│   │   └── index.ts          # Express server configuration
│   └── package.json

```

## 📝 License

Designed and Developed for internal management procedures. Intellectual Property of Parth Goel.
