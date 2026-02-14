# Talent Analytics — Frontend

React frontend for the Talent Analytics HR dashboard. Login, employee directory, analytics charts, AI insights (feedback analysis, similar skills, skill gaps, career recommendations, attrition risk), and scenario planning.

## Stack

- **Vite** + **React 18**
- **React Router** v7
- **Tailwind CSS**
- **Recharts** (analytics)
- **Framer Motion** (animations)
- **Lucide React** (icons)

## Run locally

1. **Backend** must be running on `http://localhost:5001` (see `backend/`).

2. Install deps and start dev server:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to the backend.

## Demo login

- **Email:** `hr@example.com`
- **Password:** `Admin@123`

(Run `npm run seed` in `backend` if you haven’t seeded data.)

## Build

```bash
npm run build
npm run preview   # serve production build
```

## Roles

- **HR_ADMIN:** Full access (employees, analytics, AI, scenario, embeddings).
- **MANAGER:** Employees, AI (attrition, career, feedback, HiPo, skill gaps). No analytics or scenario.
- **EMPLOYEE:** Own profile only, career recommendations, skill gaps.