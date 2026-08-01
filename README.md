# SyncLab

Real-time collaboration platform for teams. Kanban boards, collaborative documents, team chat, and AI-powered task generation — all synced live via WebSocket.

## Features

- Role-based access control (Owner / Admin / Member)
- Drag-and-drop Kanban boards with task filters
- Collaborative rich-text documents with PDF export
- Real-time team chat per workspace
- Presence indicators (who's online)
- AI task generator — describe a feature, get structured tasks
- AI document assistant powered by Groq (Llama 3.3)
- Notifications for assignments and comments
- Activity history across projects

## Stack

- React + Vite
- Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (real-time sync)
- JWT auth (access + refresh tokens)
- @hello-pangea/dnd (Kanban drag & drop)
- Groq SDK (AI features)

## Project Structure

```
SyncLab/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # Reusable UI
│       ├── pages/        # Route pages
│       ├── context/      # Auth, Socket
│       └── utils/        # API client
├── server/          # Express backend
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express routes
│       ├── middleware/   # Auth, permissions
│       └── config/       # DB connection
├── package.json     # npm workspaces (root)
├── render.yaml      # Render deployment config
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### Install

```bash
npm install        # installs all workspaces
```

### Environment

Copy `server/.env.example` to `server/.env` and fill in:

```
MONGODB_URI=mongodb://localhost:27017/synclab
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-jwt-refresh-secret-here
GROQ_API_KEY=your-groq-api-key-here
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Run in development

```bash
npm run dev        # starts server + client concurrently
```

- Client: http://localhost:5173
- API: http://localhost:5000/api

## Deployment (Render)

The `render.yaml` defines a single web service that serves the built client and the API together.

1. Push this repo to GitHub
2. In Render, create a **Blueprint** from the repo (it reads `render.yaml`)
3. Set the following environment variables in the dashboard (secrets):
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — random string
   - `JWT_REFRESH_SECRET` — random string
   - `GROQ_API_KEY` — Groq key (AI features)
   - `CLIENT_URL` — your app's Render URL, e.g. `https://synclab.onrender.com`
4. Deploy. Render runs `npm ci && npm run build`, then `npm start`.

The health check hits `/api/health`.
