# Frontend (Vite + React)

This package is the browser client for the Twitter clone in the repository root. Full setup (database, API, features) is documented in the [root README](../README.md).

## Requirements

- Node.js 18+
- Backend running (default [http://localhost:3000](http://localhost:3000))

## Install

```bash
npm install
```

## Configuration

If the API is not at `http://localhost:3000`, create a `.env` file in this directory:

```env
VITE_API_BASE_URL="https://your-api.example.com"
```

The client sends cookies with every request (`withCredentials: true` in [src/api.js](src/api.js)), so the API must allow your front-end origin in CORS and issue cookies compatible with your deployment (HTTPS in production).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (default port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |

## Stack

React 19, React Router 7, TanStack Query, Axios, Vite 7. Auth state comes from [src/AuthProvider.jsx](src/AuthProvider.jsx); server state uses TanStack Query.
