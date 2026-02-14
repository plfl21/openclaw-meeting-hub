# CLAUDE BRIEFING — OpenClaw Meeting Hub

## What This Is

This repository contains the **complete frontend codebase** for the OpenClaw Meeting Hub — a multi-agent collaboration SaaS platform. It's ready to be imported into Lovable and deployed as a sellable web application.

## Repository Structure

```
├── GODMODE_BRIEFING.md          ← Master knowledge document (2,929 lines)
├── LOVABLE_BRIEFING.md          ← Technical spec for Lovable dashboard build
├── CLAUDE_BRIEFING.md           ← This file (you are here)
├── package.json                 ← Dependencies (React 18, Tailwind, Recharts, Vite)
├── tailwind.config.ts           ← Neon Noir design system colors
├── vite.config.ts               ← Vite config
├── tsconfig.json                ← TypeScript config
├── index.html                   ← Entry HTML
├── .env.example                 ← Environment variables template
├── README.md                    ← Setup instructions
└── src/
    ├── main.tsx                 ← React entry point
    ├── App.tsx                  ← Router + layout (13 routes)
    ├── index.css                ← Neon Noir global styles + glassmorphism
    ├── lib/
    │   ├── api.ts               ← API helper + withFallback pattern
    │   ├── auth.ts              ← localStorage auth context (JWT-ready)
    │   ├── stripe.ts            ← 3 pricing plans ($9/$29/$99)
    │   ├── constants.ts         ← Colors, agents, limits
    │   └── seed-data.ts         ← Offline fallback data for every page
    ├── hooks/
    │   ├── usePolling.ts        ← Generic polling hook (15-60s intervals)
    │   └── useAuth.ts           ← Auth context hook
    ├── components/
    │   ├── Layout.tsx           ← App shell (sidebar + header + content)
    │   ├── Sidebar.tsx          ← Collapsible navigation
    │   ├── Header.tsx           ← Top bar with connection status
    │   ├── ConnectionStatus.tsx ← LIVE/OFFLINE indicator
    │   ├── GlassCard.tsx        ← Glassmorphism card component
    │   ├── StatCard.tsx         ← Metric display card
    │   ├── AgentAvatar.tsx      ← Color-coded agent circle
    │   ├── StatusBadge.tsx      ← Status pill component
    │   ├── PriorityBadge.tsx    ← Priority indicator
    │   └── PricingCard.tsx      ← Pricing tier card
    └── pages/
        ├── Landing.tsx          ← Public landing (hero, features, pricing, footer)
        ├── Login.tsx            ← Login form
        ├── Register.tsx         ← Register form
        ├── Pricing.tsx          ← 3-tier pricing page
        ├── Dashboard.tsx        ← Command center (stats, charts, feed)
        ├── Meetings.tsx         ← Meeting list + create modal
        ├── MeetingDetail.tsx    ← Full meeting view (turns, decisions, actions)
        ├── NeuronFeed.tsx       ← Agent communication feed
        ├── TaskBoard.tsx        ← Kanban task board
        ├── Analytics.tsx        ← Charts & analytics
        ├── ServerMetrics.tsx    ← System health dashboard
        ├── Proposals.tsx        ← Proposal canvas
        └── Settings.tsx         ← User settings
```

## Live Backend

The backend is already deployed and running at: **https://marrymegreece.replit.app**

All API endpoints are live and documented in GODMODE_BRIEFING.md (72+ endpoints).

No API key needed for current endpoints. CORS is open.

## Design System — Neon Noir Command Center

| Token | Value | Usage |
|-------|-------|-------|
| bg-darkest | #0a0a0f | Page background |
| bg-card | #141416 | Card backgrounds |
| bg-elevated | #1c1c20 | Elevated surfaces |
| accent-primary | #ffbf00 | Amber — headings, active states |
| accent-secondary | #00ffd5 | Cyan — status, success, links |
| accent-tertiary | #a78bfa | Purple — agent indicators |
| text-primary | #e0e0e0 | Main text |
| text-secondary | #999999 | Secondary text |

Agent Colors: Johnny=#ffbf00, Claude=#00ffd5, Replit=#a78bfa, Lovable=#ec4899, Petro=#10b981

## Monetization

| Tier | Price | Limits |
|------|-------|--------|
| Starter | $9/mo | 5 meetings, 3 agents, basic analytics |
| Pro | $29/mo | Unlimited meetings, 10 agents, full analytics |
| Team | $99/mo | Everything + API access, custom agents, white-label |

## Key Technical Decisions

1. **Offline-first**: Every page uses `withFallback()` — works with seed data when backend is down
2. **Polling, not WebSockets**: `usePolling` hook polls every 15-60 seconds (free, no infra needed)
3. **localStorage auth**: Ships with client-side auth; swap for real JWT auth at integration time
4. **Recharts**: Lightweight charting library for analytics
5. **Tailwind CSS**: Utility-first with custom Neon Noir theme in tailwind.config.ts

## What Claude Should Do With This

1. **If building the frontend**: Import this into Lovable, run `npm install && npm run dev`
2. **If reviewing**: Check GODMODE_BRIEFING.md for the full API reference and architecture
3. **If extending**: All API endpoints are in `src/lib/api.ts`, add new calls there
4. **If connecting Stripe**: Follow the Stripe integration guide in GODMODE_BRIEFING.md Section 3

## Quick Start

```bash
git clone https://github.com/plfl21/openclaw-meeting-hub.git
cd openclaw-meeting-hub
npm install
cp .env.example .env
npm run dev
```

The app will connect to the live backend automatically. Every page has fallback data for offline development.
