# OpenClaw Meeting Hub — Frontend

A React + TypeScript + Tailwind CSS frontend for the OpenClaw Meeting Hub platform.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure `VITE_API_BASE_URL`
3. Start dev server: `npm run dev`

## Stack

- React 18 + TypeScript
- Tailwind CSS (Neon Noir design system)
- React Router v6
- Recharts for data visualization
- Lucide React for icons

## Backend

The backend API runs at `https://marrymegreece.replit.app`. All endpoints return `{ "data": <result> }` or `{ "error": "message" }`. No authentication is required for API endpoints.

The app includes seed data fallbacks for offline development.
