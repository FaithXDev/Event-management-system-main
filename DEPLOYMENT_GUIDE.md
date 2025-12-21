# Deployment Guide for Event Management System

This project consists of two parts:
1. **Frontend**: A Vite + React application (located in `Frontendd/`)
2. **Backend**: A Node.js + Express application (located in `backend/`)

You need to deploy them separately.

## 1. Backend Deployment (Render.com)
Render is a great free option for Node.js backends.

1.  **Push your latest code to GitHub.**
2.  **Log in to [Render](https://render.com/).**
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub repository.
5.  **Configure the Service:**
    *   **Name:** `ems-backend` (or similar)
    *   **Root Directory:** `backend` (Important!)
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
6.  **Environment Variables (Advanced):**
    *   Add your variables from your `.env` file (e.g., `MONGO_URI`, `JWT_SECRET`, `PORT`).
    *   *Note: Render uses port 10000 by default, but it handles the `PORT` variable automatically.*
7.  Click **"Create Web Service"**.
8.  **Copy the URL:** Once deployed, copy the URL (e.g., `https://ems-backend.onrender.com`). You will need this for the frontend.

## 2. Frontend Deployment (Vercel)
Vercel is optimized for frontend frameworks like Vite.

1.  **Log in to [Vercel](https://vercel.com/).**
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Configure the Project:**
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** Click "Edit" and select `Frontendd`.
    *   **Build Command:** `npm run build` (Default)
    *   **Output Directory:** `dist` (Default)
5.  **Environment Variables:**
    *   You likely need to tell the frontend where the backend is.
    *   Open your frontend code and check valid API base URL configuration. If you are using a proxy in `vite.config.js`, that only works locally!
    *   **For Production:** You typically need a `.env` variable like `VITE_API_BASE_URL`.
    *   Add `VITE_API_BASE_URL` = `https://ems-backend.onrender.com` (The URL you copied from Render).
6.  Click **"Deploy"**.

## 3. Important: Code Adjustment for Production
Since you are currently using a proxy in `vite.config.js` (`/api` -> `localhost:5050`), this **WILL NOT WORK** in production. The deployed frontend needs to know the full URL of the deployed backend.

**Action Required:**
Ensure your API calls in the frontend use the full URL in production.
Example setup in your `src/api/axios.js` or wherever you make requests:

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
// Use BASE_URL for all your requests
```
