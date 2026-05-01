# Team Task Manager

Full-stack task management app with authentication, role-based access control, projects, tasks, and dashboard analytics.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT + bcrypt
- Charts: Recharts

## Features

- Signup/Login with JWT auth
- Role-based access:
  - Admin: create projects, assign/manage tasks, delete tasks
  - Member: view assigned tasks and update task status
- Project management with members
- Task CRUD and status tracking
- Dashboard stats:
  - Total tasks
  - Completed tasks
  - Overdue tasks
  - Tasks by status chart

## Local Setup

### 1) Backend

```bash
cd server
npm install
```

Create `.env` from `.env.example`.

```bash
npm run dev
```

### 2) Frontend

```bash
cd client
npm install
```

Create `.env` from `.env.example` (optional for local; proxy works by default).

```bash
npm run dev
```

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/users` (Admin only)

### Projects

- `POST /api/projects` (Admin only)
- `GET /api/projects`
- `GET /api/projects/:id`

### Tasks

- `POST /api/tasks` (Admin only)
- `GET /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id` (Admin only)
- `GET /api/tasks/dashboard/stats`

## Railway Deployment

Deploy as two services from the same repo:

1. Backend service
   - Root directory: `server`
   - Start command: `npm start`
   - Environment variables:
     - `MONGO_URI`
     - `JWT_SECRET`
     - `CLIENT_URL` (frontend URL after deploy)
   - Important: MongoDB Atlas must allow Railway outbound IPs, or use `0.0.0.0/0` for testing in Atlas Network Access.

2. Frontend service
   - Root directory: `client`
   - Build command: `npm run build`
   - Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - Environment variable:
     - `VITE_API_URL` (backend URL + `/api`)

If you want to deploy the backend and frontend together as a single Railway service, use the repo root with:

- Build command: `npm run build`
- Start command: `npm start`

Once deployed, update backend `CLIENT_URL` with the frontend domain.
