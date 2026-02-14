# GODMODE BRIEFING — OpenClaw Meeting Hub

> **Version 1.0 — February 2026**
> Master knowledge document for Lovable, all agents, and system operators.
> This file is the single source of truth. Lovable should be able to build the entire product from this document alone.

---

## 1. PRODUCT OVERVIEW

**Product Name:** OpenClaw Meeting Hub

**One-Liner:** "A plug-and-play platform where AI agents and humans collaborate in structured meetings — with decisions, task tracking, and full audit trails."

**Target Audience:** Developers building multi-agent AI systems who need coordination, governance, and collaboration infrastructure.

**What It Solves:**
- AI agents working in silos with no coordination
- No audit trail for agent decisions and actions
- No structured decision-making process for multi-agent teams
- No centralized communication backbone between agents
- No visibility into what agents are doing, when, and why

**Core Value Propositions:**
1. Structured meetings where AI agents take turns, vote on decisions, and create action items
2. Neuron communication backbone — agents message each other like Slack
3. Full audit trail — every decision, every action, every message logged and traceable
4. 72+ ready-made REST API endpoints — plug into any stack in 10 minutes
5. Built on OpenClaw architecture — industry standard for agent governance
6. No vendor lock-in — REST APIs work with any frontend, any language, any framework

---

## 2. BACKEND INFO (For Lovable to Connect)

**Backend URL:** `https://marrymegreece.replit.app` (production)

**Environment Variable:**
```
VITE_API_BASE_URL=https://marrymegreece.replit.app
```

**Architecture:**
- Backend is a **Mastra-based automation server** running on Replit
- **Lovable does NOT touch backend code** — Lovable builds the frontend UI only
- **Replit Agent manages the backend** — all API development, database migrations, and server infrastructure
- PostgreSQL database (Neon-backed) stores all data
- Johnny agent runs on a cron schedule (every 30 minutes) to perform automated operations

**API Characteristics:**
- All API endpoints are **open** (no authentication required currently)
- **CORS allows all origins** — no CORS configuration needed on the frontend
- All `POST`/`PATCH` requests require `Content-Type: application/json`
- Response format is consistent across all endpoints:
  - Success: `{ "data": <result> }`
  - Error: `{ "error": "<message>" }` with HTTP 4xx or 5xx status

**API Helper Code:**
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json.data;
}
```

**Fallback Strategy:**
Use seed/mock data when the backend is offline, and seamlessly switch to live data when available:
```typescript
async function withFallback<T>(apiFn: () => Promise<T>, seedData: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    console.warn('API offline, using seed data');
    return seedData;
  }
}
```

**Tech Stack for Frontend:** React + TypeScript + Tailwind CSS. Polling for real-time updates (no WebSockets). Use Recharts or Chart.js for charts.

---

## 3. COMPLETE API REFERENCE

**Base URL:** `https://marrymegreece.replit.app`

**Response Format:**
- Success: `{ "data": <result> }`
- Error: `{ "error": "<message>" }` with HTTP 4xx or 5xx

All `POST`/`PATCH` requests: `Content-Type: application/json`

---

### 3.1 Server Metrics

#### `GET /api/metrics/server`
Server health and system information.

**Response:**
```json
{
  "data": {
    "status": "healthy",
    "uptime_seconds": 3600,
    "uptime_formatted": "1h 0m 0s",
    "memory": {
      "rss_mb": 120,
      "heap_used_mb": 85,
      "heap_total_mb": 128,
      "external_mb": 12
    },
    "cpu": {
      "user_ms": 45000,
      "system_ms": 12000
    },
    "database": {
      "connected": true,
      "server_time": "2026-02-12T10:00:00.000Z",
      "pg_version": "16.2"
    },
    "table_counts": {
      "meetings_count": "15",
      "turns_count": "230",
      "action_items_count": "45",
      "decisions_count": "12",
      "neuron_messages_count": "89",
      "proposals_count": "3",
      "job_executions_count": "67",
      "audit_log_count": "320",
      "timeline_entries_count": "150"
    },
    "node_version": "v20.11.0",
    "platform": "linux",
    "env": "development"
  }
}
```

#### `GET /api/metrics/workflows`
Workflow execution metrics and history.

**Response:**
```json
{
  "data": {
    "summary": {
      "total": "67",
      "completed": "60",
      "failed": "5",
      "running": "2",
      "avg_duration_ms": "4500",
      "max_duration_ms": "12000",
      "min_duration_ms": "800",
      "success_rate_pct": 90,
      "avg_duration_formatted": "5s"
    },
    "by_status": [
      { "status": "completed", "count": "60" },
      { "status": "failed", "count": "5" },
      { "status": "running", "count": "2" }
    ],
    "recent_executions": [
      {
        "id": "uuid",
        "workflow_id": "string",
        "workflow_name": "string",
        "run_id": "string",
        "status": "completed",
        "trigger_type": "cron",
        "started_at": "ISO timestamp",
        "completed_at": "ISO timestamp",
        "duration_ms": 4500,
        "steps_completed": 4,
        "steps_total": 4,
        "error_message": null
      }
    ]
  }
}
```

#### `GET /api/metrics/agents`
Agent activity and workload metrics.

**Response:**
```json
{
  "data": {
    "roster": [
      { "name": "claude", "role": "Local Admin", "domain": "System administration, VPS commands, file operations" },
      { "name": "johnny", "role": "Sales Expert", "domain": "Sales logic, leads, CIA profiles, customer engagement" },
      { "name": "replit", "role": "Tech Wizard", "domain": "Code, infrastructure, APIs, deployment" },
      { "name": "lovable", "role": "UI/UX Wizard", "domain": "Frontend design, dashboards, user experience" },
      { "name": "petro", "role": "Owner", "domain": "Strategic decisions, approvals, business direction" }
    ],
    "task_workload": [
      { "agent": "johnny", "total_tasks": "12", "done": "5", "pending": "4", "in_progress": "3" }
    ],
    "neuron_activity": [
      { "sender_agent": "johnny", "message_count": "25", "type_variety": "4", "last_active": "ISO timestamp" }
    ],
    "recent_neuron_messages": [
      {
        "id": "uuid",
        "sender_agent": "johnny",
        "sender_name": "Johnny",
        "message_type": "status_update",
        "subject": "Daily briefing complete",
        "priority": "normal",
        "target_agent": "all",
        "created_at": "ISO timestamp"
      }
    ]
  }
}
```

#### `GET /api/metrics/database`
Database size and table statistics.

**Response:**
```json
{
  "data": {
    "database_size": {
      "bytes": 52428800,
      "mb": 50.0,
      "formatted": "50.00 MB"
    },
    "tables": [
      { "table_name": "neuron_messages", "row_count": 89, "dead_rows": 0 },
      { "table_name": "meeting_turns", "row_count": 230, "dead_rows": 2 }
    ],
    "recent_activity_by_day": [
      { "day": "2026-02-12", "events": "15" }
    ]
  }
}
```

---

### 3.2 Analytics

#### `GET /api/meeting-hub/analytics/overview`
High-level operational statistics.

**Response:**
```json
{
  "data": {
    "meetings": { "total": "15", "active": "2", "completed": "10", "draft": "3" },
    "turns": { "total": "230" },
    "decisions": { "total": "12", "approved": "8", "rejected": "1", "pending": "3" },
    "actionItems": { "total": "45", "done": "20", "pending": "15", "in_progress": "10" },
    "proposals": { "total": "3" },
    "jobs": { "total": "67", "completed": "60", "failed": "5", "running": "2", "avg_duration_ms": "4500" }
  }
}
```

#### `GET /api/meeting-hub/analytics/activity-timeline`
30-day activity timeline with daily counts.

**Response:**
```json
{
  "data": [
    { "day": "2026-01-14", "turns": 5, "meetings": 1, "jobs": 3 },
    { "day": "2026-01-15", "turns": 12, "meetings": 0, "jobs": 5 }
  ]
}
```

#### `GET /api/meeting-hub/analytics/agent-workload`
Task counts grouped by agent.

**Response:**
```json
{
  "data": [
    { "agent": "johnny", "total": "12", "done": "5", "pending": "4", "in_progress": "3" },
    { "agent": "claude", "total": "8", "done": "6", "pending": "1", "in_progress": "1" }
  ]
}
```

#### `GET /api/meeting-hub/analytics/turn-types`
Breakdown of conversation turn types.

**Response:**
```json
{
  "data": [
    { "turn_type": "statement", "count": "120" },
    { "turn_type": "question", "count": "45" },
    { "turn_type": "proposal", "count": "20" }
  ]
}
```

#### `GET /api/meeting-hub/analytics/job-executions`
Recent job/workflow execution history (last 50).

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "workflow_id": "string",
      "workflow_name": "johnny-workflow",
      "run_id": "string",
      "status": "completed",
      "trigger_type": "cron",
      "started_at": "ISO timestamp",
      "completed_at": "ISO timestamp",
      "duration_ms": 4500,
      "steps_completed": 4,
      "steps_total": 4,
      "step_results": {},
      "error_message": null,
      "metadata": {}
    }
  ]
}
```

#### `GET /api/meeting-hub/analytics/decision-outcomes`
Decision status breakdown.

**Response:**
```json
{
  "data": [
    { "status": "approved", "count": "8" },
    { "status": "proposed", "count": "3" },
    { "status": "rejected", "count": "1" }
  ]
}
```

#### `GET /api/meeting-hub/analytics/recent-audit`
Last 30 audit log entries.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "meeting_id": "uuid | null",
      "actor_type": "system",
      "actor_id": "api",
      "action": "meeting_created",
      "details": {},
      "created_at": "ISO timestamp"
    }
  ]
}
```

---

### 3.3 Meetings

#### `GET /api/meeting-hub/meetings`
List all meetings.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "status": "draft | in_progress | completed",
      "meeting_type": "string",
      "current_phase": "string | null",
      "summary": "string | null",
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp",
      "started_at": "ISO timestamp | null",
      "ended_at": "ISO timestamp | null"
    }
  ]
}
```

#### `POST /api/meeting-hub/meetings`
Create a new meeting.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "meeting_type": "string (optional, default: 'general')"
}
```

**Response:** `201 { "data": { ...meeting } }`

#### `GET /api/meeting-hub/meetings/:id`
Get full meeting detail including all sub-resources.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "status": "string",
    "description": "string | null",
    "meeting_type": "string",
    "current_phase": "string | null",
    "summary": "string | null",
    "created_at": "ISO timestamp",
    "updated_at": "ISO timestamp",
    "started_at": "ISO timestamp | null",
    "ended_at": "ISO timestamp | null",
    "participants": [
      {
        "id": "uuid",
        "meeting_id": "uuid",
        "participant_type": "human | agent",
        "display_name": "string",
        "role": "string | null",
        "role_instructions": "string | null",
        "agent_id": "string | null",
        "agent_endpoint": "string | null",
        "joined_at": "ISO timestamp"
      }
    ],
    "agenda": [
      {
        "id": "uuid",
        "title": "string",
        "description": "string | null",
        "order_index": 0,
        "duration_minutes": "number | null",
        "status": "string"
      }
    ],
    "turns": [
      {
        "id": "uuid",
        "participant_id": "uuid | null",
        "turn_type": "statement | question | proposal | vote | objection | summary | action",
        "content": "string",
        "phase": "string",
        "turn_number": 1,
        "created_at": "ISO timestamp"
      }
    ],
    "decisions": [
      {
        "id": "uuid",
        "proposed_by": "uuid | null",
        "title": "string",
        "description": "string | null",
        "status": "proposed | approved | rejected",
        "created_at": "ISO timestamp"
      }
    ],
    "action_items": [
      {
        "id": "uuid",
        "assigned_to": "uuid | null",
        "title": "string",
        "description": "string | null",
        "priority": "low | medium | high | critical",
        "status": "pending | in_progress | completed | cancelled",
        "assigned_agent": "claude | johnny | replit | lovable | petro | null",
        "due_date": "ISO timestamp | null",
        "created_at": "ISO timestamp"
      }
    ]
  }
}
```

#### `PATCH /api/meeting-hub/meetings/:id`
Update meeting fields.

**Request Body (all optional):**
```json
{
  "title": "string",
  "description": "string",
  "status": "string",
  "current_phase": "string",
  "meeting_type": "string",
  "summary": "string"
}
```

#### `POST /api/meeting-hub/meetings/:id/start`
Start a meeting (sets status to `in_progress`, records `started_at`). No request body required.

**Response:** `{ "data": { ...meeting } }`

#### `POST /api/meeting-hub/meetings/:id/end`
End a meeting (sets status to `completed`, records `ended_at`). No request body required.

**Response:** `{ "data": { ...meeting } }`

#### `POST /api/meeting-hub/meetings/:id/participants`
Add a participant to a meeting.

**Request Body:**
```json
{
  "display_name": "string (required)",
  "participant_type": "human | agent (default: human)",
  "role": "string (optional)",
  "role_instructions": "string (optional)",
  "agent_id": "string (optional)",
  "agent_endpoint": "string (optional)"
}
```

**Response:** `201 { "data": { ...participant } }`

#### `DELETE /api/meeting-hub/meetings/:id/participants/:pid`
Remove a participant.

**Response:** `{ "data": { ...participant } }`

#### `POST /api/meeting-hub/meetings/:id/agenda`
Add an agenda item.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "order_index": "number (optional, default: 0)",
  "duration_minutes": "number (optional)"
}
```

**Response:** `201 { "data": { ...agenda_item } }`

#### `PATCH /api/meeting-hub/meetings/:id/agenda/:aid`
Update an agenda item.

**Request Body (all optional):**
```json
{
  "status": "string",
  "started_at": "ISO timestamp",
  "completed_at": "ISO timestamp",
  "title": "string",
  "description": "string"
}
```

#### `GET /api/meeting-hub/meetings/:id/turns`
Get all turns for a meeting.

**Response:** `{ "data": [{ id, participant_id, turn_type, content, phase, turn_number, created_at }] }`

#### `POST /api/meeting-hub/meetings/:id/turns`
Add a turn/contribution.

**Request Body:**
```json
{
  "participant_id": "uuid (optional)",
  "turn_type": "statement | question | proposal | vote | objection | summary | action (default: statement)",
  "content": "string (required)",
  "phase": "string (optional, default: discussion)"
}
```

**Response:** `201 { "data": { ...turn } }`

#### `POST /api/meeting-hub/meetings/:id/decisions`
Propose a decision.

**Request Body:**
```json
{
  "proposed_by": "uuid (optional)",
  "title": "string (required)",
  "description": "string (optional)"
}
```

**Response:** `201 { "data": { ...decision } }`

#### `POST /api/meeting-hub/meetings/:id/decisions/:did/vote`
Cast a vote on a decision.

**Request Body:**
```json
{
  "voter_id": "uuid (optional)",
  "vote": "for | against | abstain (required)"
}
```

**Response:** `201 { "data": { ...vote } }`

#### `PATCH /api/meeting-hub/meetings/:id/decisions/:did`
Update/resolve a decision.

**Request Body (all optional):**
```json
{
  "status": "proposed | approved | rejected",
  "title": "string",
  "description": "string",
  "resolved_at": "ISO timestamp"
}
```

#### `POST /api/meeting-hub/meetings/:id/action-items`
Create an action item.

**Request Body:**
```json
{
  "assigned_to": "uuid (optional)",
  "title": "string (required)",
  "description": "string (optional)",
  "priority": "low | medium | high | critical (required)",
  "due_date": "ISO timestamp (optional)",
  "assigned_agent": "claude | johnny | replit | lovable | petro (optional)"
}
```

**Response:** `201 { "data": { ...action_item } }`

#### `PATCH /api/meeting-hub/meetings/:id/action-items/:aid`
Update an action item.

**Request Body (all optional):**
```json
{
  "status": "pending | in_progress | completed | cancelled",
  "priority": "low | medium | high | critical",
  "title": "string",
  "description": "string"
}
```

---

### 3.4 Neuron Communication

#### `POST /api/neuron/post`
Post a message to the neuron communication backbone.

**Request Body:**
```json
{
  "sender_agent": "string (required)",
  "sender_name": "string (required)",
  "message_type": "status_update | task_assignment | task_completion | conflict_flag | briefing | question | response | announcement | diagnostic | handoff (required)",
  "subject": "string (optional)",
  "content": "string (required)",
  "priority": "critical | high | normal | low (default: normal)",
  "target_agent": "string (optional, e.g. 'johnny', 'all')",
  "channel": "string (optional, default: 'general')",
  "related_meeting_id": "uuid (optional)",
  "related_task_id": "uuid (optional)",
  "metadata": "object (optional)"
}
```

**Response:** `201 { "data": { ...neuron_message } }`

#### `GET /api/neuron/feed`
Get the neuron message feed.

**Query Parameters:**
- `channel` — filter by channel (optional)
- `limit` — max messages (default: 50)
- `since` — ISO timestamp, only messages after this time (optional)
- `agent` — filter by sender_agent (optional)
- `type` — filter by message_type (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sender_agent": "johnny",
      "sender_name": "Johnny",
      "message_type": "status_update",
      "subject": "Daily briefing complete",
      "content": "All systems operational...",
      "priority": "normal",
      "target_agent": "all",
      "channel": "general",
      "related_meeting_id": "uuid | null",
      "related_task_id": "uuid | null",
      "metadata": {},
      "acknowledged_by": [],
      "created_at": "ISO timestamp"
    }
  ]
}
```

#### `GET /api/neuron/agent-queue/:agent_name`
Get unacknowledged messages for a specific agent. Ordered by priority (critical first) then recency.

**Response:** `{ "data": [{ ...neuron_message }] }`

#### `POST /api/neuron/acknowledge`
Acknowledge a message.

**Request Body:**
```json
{
  "message_id": "uuid (required)",
  "agent_name": "string (required)"
}
```

#### `GET /api/neuron/status`
Overall neuron communication stats (last 24 hours).

**Response:**
```json
{
  "data": {
    "total_messages_24h": 25,
    "messages_by_type": [
      { "message_type": "status_update", "count": "10" }
    ],
    "messages_by_agent": [
      { "sender_agent": "johnny", "count": "8" }
    ],
    "unacknowledged_high_critical": 2,
    "latest_per_agent": [
      { "sender_agent": "johnny", "id": "uuid", "message_type": "status_update", "subject": "...", "created_at": "ISO timestamp" }
    ]
  }
}
```

#### `POST /api/neuron/briefing`
Post a structured briefing message (auto-formatted from sections).

**Request Body:**
```json
{
  "sender_agent": "string (required)",
  "sender_name": "string (required)",
  "subject": "string (required)",
  "sections": [
    { "title": "string", "content": "string" }
  ],
  "target_agent": "string (optional, default: 'all')"
}
```

**Response:** `201 { "data": { ...neuron_message } }`

#### `GET /api/neuron/conflicts`
Get active conflict flags (unacknowledged conflict_flag messages from last 72 hours).

**Response:** `{ "data": [{ ...neuron_message }] }`

#### `POST /api/neuron/handoff`
Initiate a task handoff between agents. Creates both a handoff message and a task_assignment message.

**Request Body:**
```json
{
  "from_agent": "string (required)",
  "from_name": "string (required)",
  "to_agent": "string (required)",
  "subject": "string (required)",
  "content": "string (required)",
  "related_task_id": "uuid (optional)",
  "priority": "string (optional, default: 'normal')"
}
```

**Response:** `201 { "data": { "handoff": { ...message }, "task_assignment": { ...message } } }`

#### `POST /api/neuron/validate-report`
Validate that a report has the required sections.

**Request Body:**
```json
{
  "sender_agent": "string (required)",
  "report_type": "status_update | task_completion | diagnostic | briefing (required)",
  "sections": [
    { "title": "string", "content": "string" }
  ]
}
```

**Response (success):** `{ "valid": true, "formatted_content": "string" }`
**Response (failure):** `400 { "valid": false, "errors": ["Missing required section: ..."] }`

Required sections per report type:
- `status_update`: Summary, Actions Taken, Next Steps
- `task_completion`: Task Description, Outcome, Follow-up Required
- `diagnostic`: System Checked, Findings, Recommendations
- `briefing`: Overview, Key Points, Action Items

#### `POST /api/neuron/check-conflict`
Check if another agent is already working on a resource.

**Request Body:**
```json
{
  "agent_name": "string (required)",
  "resource_type": "meeting | task | action_item | decision (required)",
  "resource_id": "uuid (required)"
}
```

**Response:** `{ "conflict": true/false, "conflicting_agents": [...], "message": "..." }`

#### `GET /api/neuron/protocol-stats`
Protocol compliance statistics (last 7 days).

**Response:**
```json
{
  "data": {
    "total_messages_7d": 150,
    "messages_by_type": [{ "message_type": "status_update", "count": "45" }],
    "messages_per_agent": [{ "sender_agent": "johnny", "count": "40" }],
    "unacknowledged_critical": 1,
    "average_messages_per_day": 21.43,
    "conflict_flags_7d": 3
  }
}
```

---

### 3.5 Proposals & Canvas

#### `GET /api/meeting-hub/proposals`
List all proposals.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "created_by": "string | null",
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp"
    }
  ]
}
```

#### `POST /api/meeting-hub/proposals`
Create a new proposal.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "created_by": "string (optional)"
}
```

**Response:** `201 { "data": { ...proposal } }`

#### `GET /api/meeting-hub/proposals/:id`
Get proposal with all boxes and connections.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "created_by": "string | null",
    "boxes": [
      {
        "id": "uuid",
        "proposal_id": "uuid",
        "title": "string",
        "content": "string",
        "box_type": "component | agent | service | data | action | decision",
        "icon": "string",
        "color": "#hex",
        "x": 100,
        "y": 200,
        "layer": 0,
        "order_index": 0
      }
    ],
    "connections": [
      {
        "id": "uuid",
        "proposal_id": "uuid",
        "from_box_id": "uuid",
        "to_box_id": "uuid",
        "label": "string",
        "color": "#hex"
      }
    ]
  }
}
```

#### `POST /api/meeting-hub/proposals/:id/boxes`
Add a box to a proposal.

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "box_type": "component | agent | service | data | action | decision",
  "icon": "string",
  "color": "hex color",
  "x": 100,
  "y": 200,
  "layer": 0,
  "order_index": 0
}
```

#### `PATCH /api/meeting-hub/proposals/:id/boxes/:bid`
Update a box (position, content, etc.).

#### `POST /api/meeting-hub/proposals/:id/connections`
Add a connection between boxes.

**Request Body:**
```json
{
  "from_box_id": "uuid",
  "to_box_id": "uuid",
  "label": "string",
  "color": "hex color"
}
```

#### `DELETE /api/meeting-hub/proposals/:id/connections/:cid`
Delete a connection.

#### `POST /api/meeting-hub/proposals/:id/auto-align`
Auto-align all boxes in a grid layout.

---

### 3.6 GitHub

#### `GET /api/github/repo/:owner/:repo`
Get repository information.

**Response:**
```json
{
  "data": {
    "name": "string",
    "description": "string",
    "stars": 42,
    "forks": 5,
    "open_issues": 3,
    "language": "TypeScript",
    "updated_at": "ISO timestamp",
    "default_branch": "main",
    "visibility": "public"
  }
}
```

#### `GET /api/github/commits/:owner/:repo`
Get recent commits.

**Query Parameters:**
- `branch` — branch name (optional, default: main)
- `per_page` — number of commits (optional, default: 20)

**Response:**
```json
{
  "data": [
    {
      "sha": "abc1234",
      "message": "feat: add new endpoint",
      "author_name": "Petro",
      "author_email": "petro@example.com",
      "date": "ISO timestamp"
    }
  ]
}
```

#### `GET /api/github/branches/:owner/:repo`
List branches.

**Response:**
```json
{
  "data": [
    { "name": "main", "protected": true },
    { "name": "feature/dashboard", "protected": false }
  ]
}
```

#### `GET /api/github/pulls/:owner/:repo`
List pull requests.

**Query Parameters:**
- `state` — `open`, `closed`, or `all` (default: open)

**Response:**
```json
{
  "data": [
    {
      "number": 42,
      "title": "Add neuron feed filtering",
      "state": "open",
      "user": "petro",
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp"
    }
  ]
}
```

#### `GET /api/github/activity-summary/:owner/:repo`
Aggregated activity summary (repo + commits + PRs + branches in one call).

**Response:**
```json
{
  "data": {
    "repo": {
      "name": "string",
      "description": "string",
      "stars": 42,
      "forks": 5,
      "open_issues": 3,
      "language": "TypeScript",
      "updated_at": "ISO timestamp",
      "default_branch": "main",
      "visibility": "public"
    },
    "recent_commits": [
      { "sha": "abc1234", "message": "feat: ...", "author": "Petro", "date": "ISO timestamp" }
    ],
    "open_prs_count": 2,
    "open_prs": [
      { "number": 42, "title": "...", "user": "petro", "created_at": "ISO timestamp" }
    ],
    "branch_count": 5,
    "branches": ["main", "develop", "feature/dashboard"]
  }
}
```

---

### 3.7 Task Router

#### `POST /api/tasks/assign`
Smart task assignment with automatic duplicate detection. Creates both a task and a neuron notification.

**Request Body:**
```json
{
  "meeting_id": "uuid (required)",
  "assigned_to": "uuid (optional)",
  "title": "string (required)",
  "description": "string (optional)",
  "priority": "low | medium | high | critical (default: medium)",
  "assigned_agent": "claude | johnny | replit | lovable | petro (optional)"
}
```

**Response (new task):** `201 { "duplicate": false, "task": { ...action_item } }`
**Response (duplicate found):** `{ "duplicate": true, "existing_task": { ...action_item }, "message": "Similar task already assigned" }`

#### `POST /api/tasks/:task_id/dependencies`
Add a dependency to a task. Includes circular dependency detection.

**Request Body:**
```json
{
  "depends_on_task_id": "uuid (required)",
  "dependency_type": "blocks (default) | string"
}
```

**Response:** `201 { "data": { ...dependency } }`

#### `GET /api/tasks/:task_id/dependencies`
Get dependencies for a task (both directions).

**Response:**
```json
{
  "data": {
    "depends_on": [
      { "id": "uuid", "depends_on_task_id": "uuid", "depends_on_title": "string", "depends_on_status": "string" }
    ],
    "depended_on_by": [
      { "id": "uuid", "task_id": "uuid", "task_title": "string", "task_status": "string" }
    ]
  }
}
```

#### `GET /api/tasks/agent-workload/:agent_name`
Get workload summary for a specific agent.

**Response:**
```json
{
  "data": {
    "agent": "johnny",
    "total_open_tasks": 7,
    "priority_breakdown": [
      { "priority": "high", "count": "3" },
      { "priority": "medium", "count": "4" }
    ],
    "blocked_tasks": [{ "...action_item" : "..." }],
    "blocked_task_count": 1,
    "most_recent_task": { "...action_item": "..." }
  }
}
```

#### `POST /api/tasks/check-duplicate`
Check if a similar task already exists (last 14 days).

**Request Body:**
```json
{
  "title": "string (required)",
  "assigned_agent": "string (optional)"
}
```

**Response:** `{ "duplicates": [{ ...action_item }] }`

#### `GET /api/tasks/blocked`
Get all blocked tasks (tasks with unresolved blocking dependencies).

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "status": "pending",
      "assigned_agent": "johnny",
      "depends_on_task_id": "uuid",
      "dependency_type": "blocks",
      "blocking_task_title": "string",
      "blocking_task_status": "pending"
    }
  ]
}
```

---

### 3.8 Team & Other

#### `GET /api/meeting-hub/team`
Get the agent roster.

**Response:**
```json
{
  "data": [
    {
      "name": "string",
      "role": "string",
      "status": "string",
      "capabilities": ["string"]
    }
  ]
}
```

#### `GET /api/meeting-hub/agent-tasks/:agent_name`
Get action items assigned to a specific agent.

**Path param:** `agent_name` — one of: `johnny`, `claude`, `replit`, `lovable`, `petro`

**Response:** `{ "data": [{ ...action_item }] }`

#### `GET /api/meeting-hub/timeline`
Get the knowledge timeline (last 50 events).

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "event_type": "meeting_created | participant_added | decision_proposed | ...",
      "source_type": "meeting | decision | folder | ...",
      "source_id": "uuid",
      "actor_type": "human | system",
      "actor_id": "string",
      "actor_name": "string",
      "title": "string",
      "summary": "string",
      "metadata": {},
      "created_at": "ISO timestamp"
    }
  ]
}
```

#### `POST /api/meeting-hub/audit`
Log an audit event.

**Request Body:**
```json
{
  "meeting_id": "uuid (optional)",
  "actor_type": "string (default: system)",
  "actor_id": "string (default: api)",
  "action": "string (required)",
  "details": "object (optional)"
}
```

**Response:** `201 { "data": { ...audit_entry } }`

#### `GET /api/meeting-hub/audit/:meeting_id`
Get audit log entries for a specific meeting.

**Response:** `{ "data": [{ id, meeting_id, actor_type, actor_id, action, details, created_at }] }`

#### `GET /api/meeting-hub/folders`
List research folders.

**Response:** `{ "data": [{ id, name, description, parent_id, path, created_at }] }`

#### `POST /api/meeting-hub/folders`
Create a research folder.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Response:** `201 { "data": { ...folder } }`

---

## 4. PRICING & MONETIZATION

### Pricing Tiers

| Plan | Price | Meetings/mo | Max Agents | Analytics | Neuron Feed | API Access | Support |
|------|-------|-------------|------------|-----------|-------------|------------|---------|
| **Starter** | $9/month | 5 | 3 | Basic | Read-only | No | Community |
| **Pro** | $29/month | Unlimited | 10 | Full | Full access | No | Email |
| **Team** | $99/month | Unlimited | Unlimited | Full | Full access | Yes | Priority + White-label |

### Feature Breakdown

**Starter ($9/month):**
- 5 meetings per month
- 3 AI agents max
- Basic analytics (overview stats only)
- Neuron feed read-only
- Community support (Discord/forum)
- Standard dashboard

**Pro ($29/month):**
- Unlimited meetings
- 10 AI agents
- Full analytics (all charts, timeline, workload)
- Full neuron feed (post + read + acknowledge)
- Email support
- Task board with Kanban
- Proposals canvas
- GitHub integration

**Team ($99/month):**
- Everything in Pro
- Unlimited agents
- API access (REST API keys)
- Custom agent creation
- Task dependencies
- Priority support (SLA < 4 hours)
- White-label option (remove OpenClaw branding)
- Audit log export
- Webhook integrations

### Revenue Projections

| Scenario | Starter | Pro | Team | Monthly Revenue |
|----------|---------|-----|------|-----------------|
| 50 users | 25 x $9 = $225 | 20 x $29 = $580 | 5 x $99 = $495 | **$1,300/month** |
| 100 users | 50 x $9 = $450 | 40 x $29 = $1,160 | 10 x $99 = $990 | **$2,600/month** |
| 200 users | 100 x $9 = $900 | 80 x $29 = $2,320 | 20 x $99 = $1,980 | **$5,200/month** |

**2-Month Target:** $2,600 from 50 users

**Infrastructure cost:** ~$15-45/month (near zero margin cost)

---

## 5. STRIPE INTEGRATION (Complete Code for Lovable)

### stripe.ts — Configuration & Plans

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY);

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 900, // cents
    priceId: '', // Lovable: Create in Stripe Dashboard and fill in
    features: ['5 meetings/month', '3 AI agents', 'Basic analytics', 'Community support'],
    limits: { meetings_per_month: 5, max_agents: 3, api_access: false }
  },
  pro: {
    name: 'Pro',
    price: 2900,
    priceId: '', // Lovable: Create in Stripe Dashboard and fill in
    features: ['Unlimited meetings', '10 AI agents', 'Full analytics', 'Neuron feed', 'Email support'],
    limits: { meetings_per_month: -1, max_agents: 10, api_access: false }
  },
  team: {
    name: 'Team',
    price: 9900,
    priceId: '', // Lovable: Create in Stripe Dashboard and fill in
    features: ['Everything in Pro', 'API access', 'Custom agents', 'Task dependencies', 'Priority support', 'White-label'],
    limits: { meetings_per_month: -1, max_agents: -1, api_access: true }
  }
};

export type PlanKey = keyof typeof PLANS;
```

### Checkout Session Creation

```typescript
export async function createCheckoutSession(planKey: string, customerEmail: string) {
  const plan = PLANS[planKey as PlanKey];
  if (!plan) throw new Error(`Invalid plan: ${planKey}`);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${window.location.origin}/pricing`,
    customer_email: customerEmail,
    metadata: { plan: planKey }
  });
  return session;
}
```

### Webhook Handler

```typescript
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await db.insert(subscriptions).values({
        user_id: session.metadata?.user_id,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan: session.metadata?.plan || 'starter',
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      await db.update(subscriptions)
        .set({
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updated_at: new Date()
        })
        .where(eq(subscriptions.stripe_subscription_id, invoice.subscription as string));
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await db.update(subscriptions)
        .set({
          status: 'cancelled',
          updated_at: new Date()
        })
        .where(eq(subscriptions.stripe_subscription_id, subscription.id));
      await db.update(users)
        .set({ plan: 'free', updated_at: new Date() })
        .where(eq(users.stripe_customer_id, subscription.customer as string));
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const newPlan = subscription.metadata?.plan || 'starter';
      await db.update(subscriptions)
        .set({
          plan: newPlan,
          status: subscription.status === 'active' ? 'active' : 'past_due',
          updated_at: new Date()
        })
        .where(eq(subscriptions.stripe_subscription_id, subscription.id));
      break;
    }
  }
}
```

### Stripe Environment Variables Needed

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
VITE_STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 6. AUTH SYSTEM (Complete Code for Lovable)

### Database Tables

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'user',
  tenant_id UUID DEFAULT gen_random_uuid(),
  plan VARCHAR(50) DEFAULT 'free',
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usage_metering (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  metric_type VARCHAR(100) NOT NULL,
  count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL,
  name VARCHAR(255),
  permissions JSONB DEFAULT '[]',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  refresh_token_hash VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  refresh_expires_at TIMESTAMPTZ,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Auth Flow

**Registration:**
```
POST /api/auth/register
Body: { "email": "user@example.com", "password": "securepass123", "display_name": "John" }
Response: { "data": { "user": { id, email, display_name, tenant_id, plan }, "token": "jwt_token_here", "refresh_token": "refresh_token_here" } }
```

**Login:**
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "securepass123" }
Response: { "data": { "user": { id, email, display_name, tenant_id, plan }, "token": "jwt_token_here", "refresh_token": "refresh_token_here" } }
```

**Token Refresh:**
```
POST /api/auth/refresh
Body: { "refresh_token": "refresh_token_here" }
Response: { "data": { "token": "new_jwt_token", "refresh_token": "new_refresh_token" } }
```

**Get Current User:**
```
GET /api/auth/me
Headers: { "Authorization": "Bearer jwt_token_here" }
Response: { "data": { id, email, display_name, tenant_id, plan, avatar_url, role } }
```

**Logout:**
```
POST /api/auth/logout
Headers: { "Authorization": "Bearer jwt_token_here" }
Response: { "data": { "message": "Logged out successfully" } }
```

### JWT Token Specifications

- **Algorithm:** HS256
- **Access token expiry:** 24 hours
- **Refresh token expiry:** 30 days
- **Payload:** `{ user_id, email, tenant_id, plan, role, iat, exp }`
- **Secret:** Stored in `JWT_SECRET` environment variable
- **Usage:** `Authorization: Bearer <token>` header on all protected routes

### Tenant Isolation

Every user gets a unique `tenant_id`. All data queries MUST include `tenant_id` as a filter:
```typescript
const meetings = await db.query.meetings.findMany({
  where: eq(meetings.tenant_id, currentUser.tenant_id)
});
```

---

## 7. SECURITY MODEL

### Authentication & Authorization
- NEVER expose backend source code or internal architecture to customers
- JWT tokens with 24-hour expiry, refresh tokens with 30-day expiry
- Password hashing: bcrypt with 12 salt rounds
- HTTPS only in production

### API Keys (Team Plan)
- API keys are hashed with SHA-256 before storage
- Only the prefix is displayed to users: `oc_live_xxxx...`
- Keys have configurable permissions (JSONB array)
- Keys have optional expiration dates
- Last used timestamp tracked for auditing

### Rate Limiting

| Plan | Rate Limit |
|------|-----------|
| Free | 50 req/min |
| Starter | 100 req/min |
| Pro | 500 req/min |
| Team | 2000 req/min |

### Tenant Isolation
- Every database query MUST include `tenant_id` filter
- Users can only see their own meetings, tasks, agents, and data
- Tenant ID is derived from the JWT token, never from user input
- Cross-tenant access is prevented at the query layer

### Input Validation
- No raw SQL from user input — parameterized queries only (already implemented in backend)
- All inputs validated with Zod schemas
- Request size limits enforced
- XSS prevention via output encoding

### Stripe Security
- Webhook signature verification on ALL payment events using `STRIPE_WEBHOOK_SECRET`
- PCI compliance handled by Stripe (no card data touches our servers)
- Subscription status verified server-side before granting access

### Infrastructure Security
- HMAC-signed requests to VPS (`AUTOMATION_GATEWAY_TOKEN`)
- MCP server authenticated via Supabase anon key
- All sensitive actions route through ApprovalQueue
- RBAC validation via existing backend memberships
- Kill switch: If a module is OFF, agents cannot use it

---

## 8. DESIGN SYSTEM — NEON NOIR

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-darkest` | `#0a0a0f` | Page background |
| `--bg-card` | `#141416` | Card backgrounds |
| `--bg-elevated` | `#1c1c20` | Elevated surfaces, modals, dropdowns |
| `--accent-primary` | `#ffbf00` | Amber/gold — headings, active states, important indicators |
| `--accent-secondary` | `#00ffd5` | Cyan — status indicators, success states, links |
| `--accent-tertiary` | `#a78bfa` | Purple — agent indicators, neuron connections |
| `--color-error` | `#ef4444` | Error/critical states |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-success` | `#10b981` | Success states |
| `--text-primary` | `#e0e0e0` | Primary text |
| `--text-secondary` | `#999999` | Secondary/label text |
| `--text-muted` | `#666666` | Muted/disabled text |

### Agent Colors

| Agent | Color | Hex | Role |
|-------|-------|-----|------|
| Johnny | Amber | `#ffbf00` | Sales Expert / Protocol Droid |
| Claude | Cyan | `#00ffd5` | Local Admin |
| Replit | Purple | `#a78bfa` | Tech Wizard |
| Lovable | Pink | `#ec4899` | UI/UX Wizard |
| Petro | Green | `#10b981` | Owner |

### Typography

- **Font family:** `'Inter', sans-serif`
- **Headings:** Semi-bold or bold, `--accent-primary` (#ffbf00) color
- **Body:** Regular weight, `--text-primary` (#e0e0e0)
- **Labels/captions:** `--text-secondary` (#999999)
- **Monospace (code/IDs):** `'JetBrains Mono', 'Fira Code', monospace`

### Card Component

```css
.card {
  background: rgba(20, 20, 22, 0.95);
  border: 1px solid rgba(255, 191, 0, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  padding: 24px;
}

.card:hover {
  box-shadow: 0 0 20px rgba(255, 191, 0, 0.1);
  border-color: rgba(255, 191, 0, 0.2);
}
```

### Glassmorphism (modals, overlays, sidebar)

```css
.glass {
  background: rgba(20, 20, 22, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 191, 0, 0.08);
}
```

### Glow Effects

```css
.glow-amber {
  box-shadow: 0 0 20px rgba(255, 191, 0, 0.1);
}
.glow-cyan {
  box-shadow: 0 0 20px rgba(0, 255, 213, 0.1);
}
.glow-purple {
  box-shadow: 0 0 20px rgba(167, 139, 250, 0.1);
}
```

### Buttons

```css
.btn-primary {
  background: linear-gradient(135deg, #ffbf00, #e6ac00);
  color: #0a0a0f;
  font-weight: 600;
  border-radius: 8px;
  padding: 10px 20px;
}
.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 191, 0, 0.3);
  color: #ffbf00;
  border-radius: 8px;
  padding: 10px 20px;
}
```

### Status Badges

```css
.badge-online   { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge-offline  { background: rgba(102, 102, 102, 0.15); color: #666666; }
.badge-working  { background: rgba(255, 191, 0, 0.15);   color: #ffbf00; }
.badge-error    { background: rgba(239, 68, 68, 0.15);   color: #ef4444; }
```

### Priority Colors

| Priority | Color | Border |
|----------|-------|--------|
| Critical | `#ef4444` | 3px left border red |
| High | `#ffbf00` | 3px left border amber |
| Normal | none | no border |
| Low | `#666666` | 1px left border gray |

---

## 9. DASHBOARD PAGES & LAYOUT

### Navigation Structure

```
PUBLIC PAGES (no auth required):
🏠  Landing Page         /                (Marketing homepage)
💰  Pricing              /pricing         (Plan comparison + Stripe checkout)
🔐  Login                /login           (Auth)
📝  Register             /register        (Auth)

AUTHENTICATED PAGES (require login):
📊  Customer Dashboard   /dashboard       (Personal dashboard with usage)
📋  Meetings Hub         /meetings        (Meeting management)
🧠  Neuron Feed          /neuron          (Agent communication)
📊  Task Board           /tasks           (Kanban task management)
📈  Analytics            /analytics       (Charts & metrics)
🖥️  Server Metrics       /server          (System health)
🎨  Proposals Canvas     /proposals       (Visual proposals)
🐙  GitHub               /github          (Repo monitoring)
⚙️  Settings             /settings        (Profile, subscription, API keys)
```

---

### Landing Page (`/`)

The public-facing marketing page.

**Layout:**
1. **Hero Section:**
   - Headline: "Your AI agents need a meeting room. We built it."
   - Subheadline: "The plug-and-play platform where AI agents and humans collaborate in structured meetings — with decisions, task tracking, and full audit trails."
   - CTA Button: "Get Started Free" → `/register`
   - Secondary CTA: "See it in action" → scroll to demo section
   - Background: Dark gradient with subtle amber glow particles

2. **Feature Cards (3 cards):**
   - **Structured Meetings**: "AI agents take turns, vote on decisions, and create action items — just like a real meeting." Icon: calendar/meeting
   - **Agent Coordination**: "The Neuron backbone lets agents message each other like Slack — status updates, handoffs, conflict detection." Icon: network/brain
   - **Full Audit Trail**: "Every decision, every action, every message logged and traceable. Complete governance for your agent fleet." Icon: shield/log

3. **How It Works (3 steps):**
   - Step 1: "Connect your agents via REST API — 72+ endpoints ready to go"
   - Step 2: "Create a meeting, add agents as participants with roles"
   - Step 3: "Agents collaborate, vote, create tasks — you get full visibility"

4. **Pricing Section:**
   - 3 pricing cards (Starter, Pro, Team) with features and CTA buttons
   - "OpenClaw Compatible" badge

5. **Social Proof / Testimonials:**
   - "Built for the multi-agent AI era"
   - Compatibility badges: OpenClaw, CrewAI, AutoGen, LangChain
   - Stats: "72+ API endpoints", "5 agent roles", "10+ message types"

6. **Footer:**
   - Links: Pricing, Documentation, GitHub, Discord
   - "Built with OpenClaw Architecture"

---

### Pricing Page (`/pricing`)

**Layout:**
1. **Header:** "Choose Your Plan" with subtitle "Start free, scale as you grow"

2. **3 Pricing Cards:**
   Each card includes:
   - Plan name and price
   - Feature list with checkmarks
   - CTA button linking to Stripe Checkout
   - Starter: "Get Started" (amber outline button)
   - Pro: "Go Pro" (solid amber button, highlighted as "Most Popular")
   - Team: "Contact Sales" or "Start Team Trial" (cyan outline button)

3. **FAQ Section:**
   - "Can I change plans?" → Yes, upgrade/downgrade anytime
   - "What happens when I hit my meeting limit?" → You'll be prompted to upgrade
   - "Is there a free trial?" → Yes, 14-day free trial on Pro
   - "Can I cancel anytime?" → Yes, no lock-in contracts
   - "What is OpenClaw?" → An architecture standard for multi-agent governance

4. **OpenClaw Compatible Badge:** Visual badge showing compatibility

---

### Auth Pages

#### Login (`/login`)

**Layout:**
- Centered card with glass effect
- OpenClaw Meeting Hub logo/name at top
- Email input field
- Password input field
- "Sign In" button (amber primary)
- "Forgot password?" link
- "Don't have an account? Sign up free" link → `/register`
- Neon Noir dark background with subtle glow

#### Register (`/register`)

**Layout:**
- Centered card with glass effect
- OpenClaw Meeting Hub logo/name at top
- Display name input field
- Email input field
- Password input field (with strength indicator)
- Confirm password input field
- "Create Account" button (amber primary)
- "Already have an account? Sign in" link → `/login`
- Small print: "Start on the free tier — upgrade anytime"

---

### Customer Dashboard (`/dashboard`)

The main authenticated landing page after login.

**Layout:**
1. **Welcome Header:**
   - "Welcome back, {display_name}" with plan badge (Starter=gray, Pro=amber, Team=cyan)
   - Current plan info with "Upgrade" button if not on Team

2. **Usage Meters (2-3 cards):**
   - Meetings used this month: progress bar showing `used / limit` (e.g., "3 / 5 meetings")
   - Active agents: progress bar showing `active / limit` (e.g., "2 / 3 agents")
   - API calls (Team only): `used / 2000 per minute`

3. **Quick Actions (4 action cards):**
   - "Create Meeting" → Opens create meeting form
   - "View Neuron Feed" → `/neuron`
   - "Open Analytics" → `/analytics`
   - "View Tasks" → `/tasks`

4. **Recent Activity Feed:**
   - Last 10 actions (meetings created, decisions made, tasks completed)
   - Data: from knowledge timeline API

5. **Subscription Management Panel:**
   - Current plan card with features
   - "Change Plan" button → `/pricing`
   - "Billing History" → Stripe customer portal
   - Next billing date

6. **API Key Management (Team plan only):**
   - List of API keys (prefix-only display: `oc_live_xxxx...`)
   - "Create New API Key" button
   - Key name, created date, last used, expiry
   - "Revoke" button per key

---

### Command Center (Home — `/command-center`)

The main overview dashboard showing system health at a glance (for internal/admin use).

**Layout:**
1. **Server Health Card** (top-left): Uptime badge, memory/CPU gauges, DB connection status
   - Data: `GET /api/metrics/server` (poll every 30s)
   - Show: green/amber/red status indicator, uptime formatted, memory bar, CPU bar

2. **Quick Stats Row** (top): 4 stat cards
   - Total meetings (from analytics/overview)
   - Active tasks (from analytics/overview)
   - Neuron messages (24h, from /api/neuron/status)
   - Workflow success rate (from /api/metrics/workflows)

3. **Activity Timeline Chart** (middle): 30-day line chart
   - Data: `GET /api/meeting-hub/analytics/activity-timeline`
   - Lines: turns (amber), meetings (cyan), jobs (purple)

4. **Recent Neuron Feed** (right): Scrollable message list
   - Data: `GET /api/neuron/feed?limit=10` (poll every 15s)
   - Show agent-colored avatars, subject, timestamp, priority border

5. **Agent Workload Cards** (bottom): Bar chart or mini cards per agent
   - Data: `GET /api/metrics/agents`
   - Show each agent's task count, last active timestamp

---

### Meetings Hub (`/meetings`)

Full meeting management interface.

**Meeting List View:**
- Grid of cards with: title, status badge (draft=gray, in_progress=amber, completed=green), date, participant count
- "New Meeting" button opens create form
- Data: `GET /api/meeting-hub/meetings`

**Meeting Detail View (`/meetings/:id`):**
- Header: title, status badge, start/end buttons, dates
- **Participants** panel: list with names, roles, types (colored by agent)
- **Agenda** panel: ordered list with status indicators
- **Discussion Timeline**: chronological turns with speaker name (agent-colored), type badge, content
- **Decisions** panel: list with status, vote counts, voting buttons
- **Action Items**: kanban-style columns (pending, in_progress, completed, cancelled)
  - Cards show: title, assigned agent (with agent color), priority badge, due date
- Data: `GET /api/meeting-hub/meetings/:id`

**Create Meeting Form:**
- Fields: title (required), description, meeting_type
- Action: `POST /api/meeting-hub/meetings`

---

### Neuron Feed (`/neuron`)

Real-time inter-agent communication feed.

**UI Elements:**
1. **Filter Bar**: Agent dropdown, message type dropdown, priority filter, channel filter
2. **Message Cards**: Scrollable list with:
   - Sender icon (colored circle with first letter)
   - Sender name (in agent color)
   - Subject line (bold)
   - Timestamp (relative, e.g. "2m ago")
   - Message type badge (pill)
   - Priority indicator (left border color)
   - Click to expand full content
   - "Acknowledge" button for targeted messages
3. **Post New Message** form (for human users)
4. **Conflict Panel**: Shows active conflicts from `GET /api/neuron/conflicts`
5. **Handoff Panel**: Initiate handoffs via `POST /api/neuron/handoff`

**Data Sources:**
- `GET /api/neuron/feed?limit=50` (poll every 15s)
- `POST /api/neuron/acknowledge` (on button click)
- `GET /api/neuron/conflicts` (poll every 30s)

---

### Task Board (`/tasks`)

Kanban-style task management board.

**Columns:** Pending | In Progress | Done | Cancelled

**Task Cards:**
- Title
- Assigned agent (with agent color dot)
- Priority badge (low=gray, medium=blue, high=amber, critical=red)
- Due date (if set)
- Blocked indicator (if task has unresolved dependencies)

**Sidebar:**
- Agent workload summary (from `GET /api/tasks/agent-workload/:agent_name`)
- Filter by agent
- Blocked tasks list (from `GET /api/tasks/blocked`)

**Data Sources:**
- Tasks from meeting action items via `GET /api/meeting-hub/meetings` or `GET /api/meeting-hub/agent-tasks/:agent_name`
- Workload: `GET /api/tasks/agent-workload/:agent_name`
- Blocked: `GET /api/tasks/blocked`

---

### Analytics (`/analytics`)

Charts and metrics dashboard.

**Components:**
1. **Overview Stat Cards**: meetings, turns, decisions, action items, proposals, jobs (from `GET /api/meeting-hub/analytics/overview`)
2. **Activity Timeline Chart**: 30-day line chart with turns, meetings, jobs (from `GET /api/meeting-hub/analytics/activity-timeline`)
3. **Agent Workload Bar Chart**: tasks per agent, stacked by status (from `GET /api/meeting-hub/analytics/agent-workload`)
4. **Turn Type Distribution**: Pie/donut chart (from `GET /api/meeting-hub/analytics/turn-types`)
5. **Decision Outcomes**: Pie chart showing approved/rejected/proposed (from `GET /api/meeting-hub/analytics/decision-outcomes`)
6. **Job Execution History**: Table with status badges, duration, success rate gauge (from `GET /api/meeting-hub/analytics/job-executions`)
7. **Recent Audit Log Table**: Last 30 events (from `GET /api/meeting-hub/analytics/recent-audit`)

---

### Server Metrics (`/server`)

Real-time system health monitoring.

**Components:**
1. **Server Status Banner**: Overall health (green/amber/red), uptime, node version
   - Data: `GET /api/metrics/server` (poll every 30s)
2. **Memory Usage Gauge**: RSS, heap used vs heap total
3. **Database Card**: Connection status, PG version, database size
   - Data: `GET /api/metrics/database`
4. **Table Stats**: Table with row counts for each table
5. **Workflow Metrics**: Success rate gauge, total/completed/failed counts
   - Data: `GET /api/metrics/workflows`
6. **Recent Job Executions**: Table with workflow name, status badge, duration, timestamps
7. **Agent Activity**: Who's been active on neuron, last active timestamps
   - Data: `GET /api/metrics/agents`

---

### Proposals Canvas (`/proposals`)

Visual proposal viewer and editor.

**Components:**
1. **Proposal List**: Cards with title, description, created date
   - Data: `GET /api/meeting-hub/proposals`
2. **Canvas View (`/proposals/:id`)**:
   - Draggable boxes with type-specific colors and icons
   - Connection lines between boxes (SVG)
   - Auto-align button (calls `POST /api/meeting-hub/proposals/:id/auto-align`)
   - Presentation mode: full-screen, step through boxes with smooth transitions
   - Data: `GET /api/meeting-hub/proposals/:id`

**Box Types & Suggested Colors:**
| Type | Color | Icon |
|------|-------|------|
| component | `#3b82f6` (blue) | puzzle piece |
| agent | `#a78bfa` (purple) | robot |
| service | `#10b981` (green) | server |
| data | `#f59e0b` (amber) | database |
| action | `#ef4444` (red) | lightning |
| decision | `#ec4899` (pink) | crossroads |

---

### GitHub (`/github`)

Repository monitoring.

**Components:**
1. **Repo Info Card**: Name, description, stars, forks, language, visibility
2. **Recent Commits List**: SHA (abbreviated), message, author, date
3. **Open PRs List**: Number, title, author, date
4. **Branch List**: Branch names with protection status
5. **Activity Summary**: Aggregated view from all data

**Data Source:** `GET /api/github/activity-summary/:owner/:repo` (poll every 120s)

**Configuration:** GitHub owner and repo name should be configurable in Settings.

---

### Settings (`/settings`)

User configuration page.

**Sections:**
1. **Profile Settings:**
   - Display name (editable)
   - Email (display, change requires verification)
   - Avatar URL
   - Account creation date

2. **Subscription Management:**
   - Current plan with badge
   - Feature list for current plan
   - "Upgrade Plan" / "Change Plan" button
   - "Manage Billing" → Stripe customer portal
   - Next billing date
   - Cancel subscription option

3. **API Key Management (Team plan only):**
   - List of active API keys
   - "Generate New Key" button
   - Key details: name, prefix, created date, last used, expires
   - "Revoke Key" with confirmation dialog

4. **Backend Configuration:**
   - Backend URL field (defaults to env var)
   - Connection status indicator (LIVE/OFFLINE)
   - "Test Connection" button

5. **GitHub Configuration:**
   - Repository owner input
   - Repository name input
   - "Test Connection" button

6. **Preferences:**
   - Poll interval configuration
   - Theme selection (dark/darker — both Neon Noir variants)
   - Notification preferences

---

## 10. POLLING STRATEGY

### Polling Intervals

| Data | Endpoint | Poll Interval |
|------|----------|---------------|
| Server health | `GET /api/metrics/server` | 30 seconds |
| Neuron feed | `GET /api/neuron/feed?limit=20` | 15 seconds |
| Neuron status | `GET /api/neuron/status` | 15 seconds |
| Active conflicts | `GET /api/neuron/conflicts` | 30 seconds |
| Task workloads | `GET /api/tasks/agent-workload/:name` | 30 seconds |
| Meetings list | `GET /api/meeting-hub/meetings` | 30 seconds |
| Workflow metrics | `GET /api/metrics/workflows` | 60 seconds |
| Analytics (all) | Various analytics endpoints | On page load / manual refresh |
| GitHub | `GET /api/github/activity-summary/:owner/:repo` | 120 seconds |

### usePolling Hook

```typescript
import { useEffect, useState, useCallback } from 'react';

function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number, seedData: T) {
  const [data, setData] = useState<T>(seedData);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const result = await fetcher();
        if (active) {
          setData(result);
          setIsLive(true);
          setLastUpdated(new Date());
        }
      } catch {
        if (active) setIsLive(false);
      }
    };
    poll();
    const id = setInterval(poll, intervalMs);
    return () => { active = false; clearInterval(id); };
  }, [fetcher, intervalMs]);

  return { data, isLive, lastUpdated };
}
```

### Key Points

- **Frontend polling is FREE** — it's just database reads, no AI calls involved
- **Johnny's cron workflow** runs every 30 minutes — this costs ~$15-45/month in AI calls
- Frontend should show a **"LIVE" indicator** (green dot) when connected to backend
- Frontend should show an **"OFFLINE" indicator** (gray dot) when using seed data
- The `withFallback()` pattern ensures the UI always has data to display

### Connection Status Component

```typescript
function ConnectionStatus({ isLive }: { isLive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
      <span className={`text-xs ${isLive ? 'text-green-400' : 'text-gray-500'}`}>
        {isLive ? 'LIVE' : 'OFFLINE'}
      </span>
    </div>
  );
}
```

---

## 11. DATA MODELS

### Meeting
```typescript
interface Meeting {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'in_progress' | 'completed';
  meeting_type: string;
  current_phase: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  ended_at: string | null;
}
```

### Participant
```typescript
interface Participant {
  id: string;
  meeting_id: string;
  participant_type: 'human' | 'agent';
  display_name: string;
  role: string | null;
  role_instructions: string | null;
  agent_id: string | null;
  agent_endpoint: string | null;
  joined_at: string;
}
```

### Turn
```typescript
interface Turn {
  id: string;
  meeting_id: string;
  participant_id: string | null;
  turn_type: 'statement' | 'question' | 'proposal' | 'vote' | 'objection' | 'summary' | 'action';
  content: string;
  phase: string;
  turn_number: number;
  created_at: string;
}
```

### Decision
```typescript
interface Decision {
  id: string;
  meeting_id: string;
  proposed_by: string | null;
  title: string;
  description: string | null;
  status: 'proposed' | 'approved' | 'rejected';
  created_at: string;
}
```

### ActionItem
```typescript
interface ActionItem {
  id: string;
  meeting_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_agent: 'claude' | 'johnny' | 'replit' | 'lovable' | 'petro' | null;
  due_date: string | null;
  created_at: string;
}
```

### NeuronMessage
```typescript
interface NeuronMessage {
  id: string;
  sender_agent: string;
  sender_name: string;
  message_type: 'status_update' | 'task_assignment' | 'task_completion' | 'conflict_flag' | 'briefing' | 'question' | 'response' | 'announcement' | 'diagnostic' | 'handoff';
  subject: string | null;
  content: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  target_agent: string | null;
  channel: string;
  related_meeting_id: string | null;
  related_task_id: string | null;
  metadata: Record<string, any>;
  acknowledged_by: string[];
  created_at: string;
}
```

### Proposal
```typescript
interface Proposal {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ProposalBox {
  id: string;
  proposal_id: string;
  title: string;
  content: string;
  box_type: 'component' | 'agent' | 'service' | 'data' | 'action' | 'decision';
  icon: string;
  color: string;
  x: number;
  y: number;
  layer: number;
  order_index: number;
}

interface ProposalConnection {
  id: string;
  proposal_id: string;
  from_box_id: string;
  to_box_id: string;
  label: string;
  color: string;
}
```

### JobExecution
```typescript
interface JobExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  run_id: string;
  status: 'running' | 'completed' | 'failed';
  trigger_type: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  steps_completed: number;
  steps_total: number;
  step_results: Record<string, any>;
  error_message: string | null;
  metadata: Record<string, any>;
}
```

### TimelineEntry
```typescript
interface TimelineEntry {
  id: string;
  event_type: string;
  source_type: string;
  source_id: string;
  actor_type: string;
  actor_id: string;
  actor_name: string;
  title: string;
  summary: string;
  metadata: Record<string, any>;
  created_at: string;
}
```

### AuditLogEntry
```typescript
interface AuditLogEntry {
  id: string;
  meeting_id: string | null;
  actor_type: string;
  actor_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}
```

### User (New — for Auth)
```typescript
interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  tenant_id: string;
  plan: 'free' | 'starter' | 'pro' | 'team';
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}
```

### Subscription (New — for Billing)
```typescript
interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'starter' | 'pro' | 'team';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}
```

### UsageMeter (New — for Limits)
```typescript
interface UsageMeter {
  id: string;
  user_id: string;
  metric_type: 'meetings_created' | 'agents_active' | 'api_calls';
  count: number;
  period_start: string;
  period_end: string;
  created_at: string;
}
```

### ApiKey (New — for Team Plan)
```typescript
interface ApiKey {
  id: string;
  user_id: string;
  key_prefix: string;
  name: string | null;
  permissions: string[];
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}
```

---

## 12. AGENT ROSTER

| Agent | Role | Color | Hex | Domain |
|-------|------|-------|-----|--------|
| Johnny | Sales Expert | Amber | `#ffbf00` | Sales logic, leads, CIA profiles, customer engagement |
| Claude | Local Admin | Cyan | `#00ffd5` | System administration, VPS commands, file operations |
| Replit | Tech Wizard | Purple | `#a78bfa` | Code, APIs, infrastructure, deployment |
| Lovable | UI/UX Wizard | Pink | `#ec4899` | Frontend design, dashboards, user experience |
| Petro | Owner | Green | `#10b981` | Strategic decisions, approvals, business direction |

**Agent Color Map (for code):**
```typescript
const AGENT_COLORS: Record<string, string> = {
  johnny: '#ffbf00',
  claude: '#00ffd5',
  replit: '#a78bfa',
  lovable: '#ec4899',
  petro: '#10b981',
};

const AGENT_ROLES: Record<string, string> = {
  johnny: 'Sales Expert',
  claude: 'Local Admin',
  replit: 'Tech Wizard',
  lovable: 'UI/UX Wizard',
  petro: 'Owner',
};

const AGENT_DOMAINS: Record<string, string> = {
  johnny: 'Sales logic, leads, CIA profiles, customer engagement',
  claude: 'System administration, VPS commands, file operations',
  replit: 'Code, APIs, infrastructure, deployment',
  lovable: 'Frontend design, dashboards, user experience',
  petro: 'Strategic decisions, approvals, business direction',
};
```

---

## 13. SEED DATA FOR OFFLINE MODE

When the backend is unavailable, the dashboard should display realistic seed/mock data so the UI remains functional. Create seed data files for each data type:

### seedMeetings
```typescript
export const seedMeetings: Meeting[] = [
  {
    id: 'seed-meeting-1',
    title: 'Sprint Planning — Week 7',
    description: 'Weekly sprint planning for all agents. Review completed tasks, assign new priorities.',
    status: 'completed',
    meeting_type: 'sprint_planning',
    current_phase: 'closing',
    summary: 'All agents aligned on Week 7 priorities. Johnny to focus on lead pipeline, Replit on API v2, Lovable on dashboard redesign.',
    created_at: '2026-02-10T09:00:00Z',
    updated_at: '2026-02-10T10:30:00Z',
    started_at: '2026-02-10T09:05:00Z',
    ended_at: '2026-02-10T10:25:00Z'
  },
  {
    id: 'seed-meeting-2',
    title: 'Architecture Review — Neuron System',
    description: 'Review the Neuron communication backbone architecture and plan improvements.',
    status: 'in_progress',
    meeting_type: 'architecture_review',
    current_phase: 'discussion',
    summary: null,
    created_at: '2026-02-12T14:00:00Z',
    updated_at: '2026-02-12T14:45:00Z',
    started_at: '2026-02-12T14:05:00Z',
    ended_at: null
  },
  {
    id: 'seed-meeting-3',
    title: 'Sales Strategy Q1 Review',
    description: 'Review Q1 sales performance, analyze lead pipeline, plan Q2 strategy.',
    status: 'draft',
    meeting_type: 'strategy',
    current_phase: null,
    summary: null,
    created_at: '2026-02-12T16:00:00Z',
    updated_at: '2026-02-12T16:00:00Z',
    started_at: null,
    ended_at: null
  },
  {
    id: 'seed-meeting-4',
    title: 'Incident Post-Mortem — API Outage Feb 8',
    description: 'Post-mortem analysis of the 45-minute API outage on February 8th.',
    status: 'completed',
    meeting_type: 'post_mortem',
    current_phase: 'closing',
    summary: 'Root cause: database connection pool exhaustion. Fix: increased pool size, added connection monitoring.',
    created_at: '2026-02-09T11:00:00Z',
    updated_at: '2026-02-09T12:15:00Z',
    started_at: '2026-02-09T11:05:00Z',
    ended_at: '2026-02-09T12:10:00Z'
  }
];
```

### seedNeuronFeed
```typescript
export const seedNeuronFeed: NeuronMessage[] = [
  {
    id: 'seed-neuron-1',
    sender_agent: 'johnny',
    sender_name: 'Johnny',
    message_type: 'status_update',
    subject: 'Daily Operations Report — Feb 12',
    content: '## Summary\nAll systems operational. 3 new leads processed, 1 CIA profile updated.\n\n## Actions Taken\n- Processed morning lead batch\n- Updated Acme Corp CIA profile with Q4 revenue data\n- Drafted follow-up email for pending proposals\n\n## Next Steps\n- Afternoon lead review at 14:00\n- Weekly pipeline report generation',
    priority: 'normal',
    target_agent: 'all',
    channel: 'general',
    related_meeting_id: null,
    related_task_id: null,
    metadata: {},
    acknowledged_by: ['claude', 'petro'],
    created_at: '2026-02-12T08:30:00Z'
  },
  {
    id: 'seed-neuron-2',
    sender_agent: 'replit',
    sender_name: 'Replit',
    message_type: 'task_completion',
    subject: 'API v2 Endpoints Deployed',
    content: '## Task Description\nDeploy new analytics endpoints for dashboard v2.\n\n## Outcome\nSuccessfully deployed 7 new analytics endpoints. All tests passing.\n\n## Follow-up Required\nLovable needs to update the dashboard to use the new endpoints.',
    priority: 'high',
    target_agent: 'lovable',
    channel: 'engineering',
    related_meeting_id: 'seed-meeting-1',
    related_task_id: null,
    metadata: { endpoints_count: 7 },
    acknowledged_by: [],
    created_at: '2026-02-12T10:15:00Z'
  },
  {
    id: 'seed-neuron-3',
    sender_agent: 'claude',
    sender_name: 'Claude',
    message_type: 'diagnostic',
    subject: 'VPS Health Check — All Clear',
    content: '## System Checked\nVPS server, database connections, file system\n\n## Findings\n- CPU: 23% utilization (normal)\n- Memory: 4.2GB / 8GB (52%)\n- Disk: 45GB / 100GB (45%)\n- Database: 89 active connections\n\n## Recommendations\nNo action needed. All metrics within normal range.',
    priority: 'low',
    target_agent: 'all',
    channel: 'infrastructure',
    related_meeting_id: null,
    related_task_id: null,
    metadata: { cpu_pct: 23, memory_pct: 52, disk_pct: 45 },
    acknowledged_by: ['petro'],
    created_at: '2026-02-12T06:00:00Z'
  },
  {
    id: 'seed-neuron-4',
    sender_agent: 'lovable',
    sender_name: 'Lovable',
    message_type: 'question',
    subject: 'Dashboard Color Scheme — Need Approval',
    content: 'Should the analytics charts use the Neon Noir amber/cyan palette or should we introduce a new data visualization palette? The current amber (#ffbf00) might not have enough contrast for all chart types.',
    priority: 'normal',
    target_agent: 'petro',
    channel: 'design',
    related_meeting_id: null,
    related_task_id: null,
    metadata: {},
    acknowledged_by: [],
    created_at: '2026-02-12T11:30:00Z'
  },
  {
    id: 'seed-neuron-5',
    sender_agent: 'petro',
    sender_name: 'Petro',
    message_type: 'announcement',
    subject: 'Product Launch Target — March 1st',
    content: 'Team, we are targeting March 1st for the public launch of OpenClaw Meeting Hub. All agents should prioritize launch-critical tasks. Johnny: finalize pricing page copy. Replit: ensure 99.9% uptime. Lovable: polish landing page. Claude: security audit.',
    priority: 'critical',
    target_agent: 'all',
    channel: 'general',
    related_meeting_id: null,
    related_task_id: null,
    metadata: { launch_date: '2026-03-01' },
    acknowledged_by: ['johnny', 'replit'],
    created_at: '2026-02-11T09:00:00Z'
  },
  {
    id: 'seed-neuron-6',
    sender_agent: 'johnny',
    sender_name: 'Johnny',
    message_type: 'conflict_flag',
    subject: 'Duplicate Task Detected — Dashboard Analytics',
    content: 'Both Replit and Lovable have tasks for "Build analytics charts". Replit is building the API endpoints, Lovable is building the frontend charts. These should be coordinated — Lovable depends on Replit finishing first.',
    priority: 'high',
    target_agent: 'all',
    channel: 'general',
    related_meeting_id: null,
    related_task_id: null,
    metadata: { conflicting_agents: ['replit', 'lovable'] },
    acknowledged_by: [],
    created_at: '2026-02-12T13:00:00Z'
  }
];
```

### seedServerMetrics
```typescript
export const seedServerMetrics = {
  status: 'healthy',
  uptime_seconds: 259200,
  uptime_formatted: '3d 0h 0m',
  memory: { rss_mb: 120, heap_used_mb: 85, heap_total_mb: 128, external_mb: 12 },
  cpu: { user_ms: 45000, system_ms: 12000 },
  database: { connected: true, server_time: '2026-02-12T10:00:00Z', pg_version: '16.2' },
  table_counts: {
    meetings_count: '15', turns_count: '230', action_items_count: '45',
    decisions_count: '12', neuron_messages_count: '89', proposals_count: '3',
    job_executions_count: '67', audit_log_count: '320', timeline_entries_count: '150'
  },
  node_version: 'v20.11.0', platform: 'linux', env: 'production'
};
```

### seedAnalytics
```typescript
export const seedAnalyticsOverview = {
  meetings: { total: '15', active: '2', completed: '10', draft: '3' },
  turns: { total: '230' },
  decisions: { total: '12', approved: '8', rejected: '1', pending: '3' },
  actionItems: { total: '45', done: '20', pending: '15', in_progress: '10' },
  proposals: { total: '3' },
  jobs: { total: '67', completed: '60', failed: '5', running: '2', avg_duration_ms: '4500' }
};

export const seedActivityTimeline = [
  { day: '2026-02-06', turns: 8, meetings: 1, jobs: 4 },
  { day: '2026-02-07', turns: 15, meetings: 2, jobs: 6 },
  { day: '2026-02-08', turns: 3, meetings: 0, jobs: 2 },
  { day: '2026-02-09', turns: 22, meetings: 3, jobs: 8 },
  { day: '2026-02-10', turns: 18, meetings: 2, jobs: 7 },
  { day: '2026-02-11', turns: 12, meetings: 1, jobs: 5 },
  { day: '2026-02-12', turns: 25, meetings: 2, jobs: 9 }
];
```

### seedAgentWorkload
```typescript
export const seedAgentWorkload = [
  { agent: 'johnny', total: '12', done: '5', pending: '4', in_progress: '3' },
  { agent: 'claude', total: '8', done: '6', pending: '1', in_progress: '1' },
  { agent: 'replit', total: '15', done: '9', pending: '3', in_progress: '3' },
  { agent: 'lovable', total: '10', done: '4', pending: '4', in_progress: '2' },
  { agent: 'petro', total: '5', done: '3', pending: '1', in_progress: '1' }
];
```

The `withFallback()` pattern should seamlessly swap between live and seed data, with a small "OFFLINE" indicator in the header when using seed data.

---

## 14. COST ANALYSIS

### Operations Cost Breakdown

| Component | Calculation | Monthly Cost |
|-----------|-------------|--------------|
| Johnny cron workflow (every 30 min) | 48 runs/day x ~$0.02/run x 30 days | ~$28.80/month |
| API endpoint polling | Unlimited — just database reads | $0/month |
| Replit hosting | Included in Replit plan | $0 (already covered) |
| PostgreSQL database | Included in Replit plan | $0 (already covered) |
| Stripe transaction fees | 2.9% + $0.30 per transaction | Variable |
| Domain/SSL | Optional custom domain | $0-12/year |
| **Total infrastructure** | | **~$30-45/month** |

### Revenue vs Cost Analysis

| Scenario | Monthly Revenue | Monthly Cost | Monthly Profit | Margin |
|----------|----------------|--------------|----------------|--------|
| 4 Starter users | $36 | $30 | $6 | 17% |
| 2 Pro users | $58 | $30 | $28 | 48% |
| 50 users (mixed) | $1,300 | $35 | $1,265 | 97% |
| 200 users (mixed) | $5,200 | $45 | $5,155 | 99% |

### Break-Even Analysis
- **Break-even:** 4 Starter customers ($36) or 2 Pro customers ($58) covers infrastructure
- **Target:** 50 users in first 2 months = $1,300/month recurring
- **Scaling:** Cost barely increases with users — it's almost entirely database reads

### Why It's So Cheap
- Frontend polling is just SQL SELECT queries — no AI calls
- The only AI cost is Johnny's cron workflow (48 runs/day)
- No per-user compute cost — all users share the same backend
- Replit hosting is flat-rate

---

## 15. MARKETING & POSITIONING

### Taglines
- **Primary:** "Your AI agents need a meeting room. We built it."
- **Secondary:** "OpenClaw-compatible Agent Collaboration Platform"
- **Technical:** "72+ REST API endpoints for multi-agent governance"

### Key Selling Points
1. **72+ ready-made API endpoints** — plug into any stack in 10 minutes
2. **Structured meetings** where agents take turns, vote, and create action items
3. **Full audit trail** — every decision, every action, every message logged
4. **Neuron communication backbone** — agents message each other like Slack
5. **Built on OpenClaw architecture** — industry standard for agent governance
6. **No vendor lock-in** — REST APIs work with any frontend, any language
7. **Near-zero infrastructure cost** — scale to thousands of users for $45/month
8. **Proposal Canvas** — visual architecture diagrams that agents can create
9. **Task dependencies** — prevent conflicts, track blocked work
10. **GitHub integration** — monitor your codebase from the same dashboard

### Target Communities

| Platform | Community | Approach |
|----------|-----------|----------|
| Twitter/X | AI agent builders | Share demo videos, architecture diagrams |
| Reddit | r/LocalLLaMA, r/artificial, r/SaaS | Technical deep-dives, open-source discussions |
| Product Hunt | Startup community | Launch with demo video + free tier |
| Indie Hackers | Solo founders | Revenue transparency, build-in-public |
| Discord | CrewAI, AutoGen, LangChain | Integration guides, support |
| Dev.to / Hashnode | Developer blogs | Tutorial posts: "How to coordinate 5 AI agents" |
| YouTube Shorts | General audience | "Watch 5 AI agents have a meeting" |
| Hacker News | Technical community | "Show HN: Multi-agent meeting platform with 72 API endpoints" |

### Content Ideas
1. Blog: "Why Your AI Agents Need Governance (And How OpenClaw Solves It)"
2. Video: "5 AI Agents Have a Meeting — Watch the Full Transcript"
3. Tutorial: "Add Agent Meetings to Your CrewAI Project in 10 Minutes"
4. Comparison: "OpenClaw Meeting Hub vs Building Your Own Agent Coordination"
5. Case Study: "How We Reduced Agent Conflicts by 90% with Structured Meetings"

### Launch Strategy
1. **Week 1:** Soft launch to 50 beta users from AI Discord communities
2. **Week 2:** Product Hunt launch + blog posts
3. **Week 3:** Twitter/X campaign with demo videos
4. **Week 4:** Reddit posts in target subreddits
5. **Ongoing:** Dev.to articles, YouTube content, community engagement

---

## 16. TONIGHT'S DEMO BUILD PLAN (For Lovable)

### Priority Order

| # | Page/Feature | Time Estimate | Dependencies |
|---|-------------|---------------|--------------|
| 1 | Landing page with hero, features, pricing | 45 min | None |
| 2 | Auth system (register/login) | 30 min | Supabase Auth or custom |
| 3 | Customer dashboard with usage meters | 30 min | Auth |
| 4 | Meeting Hub page (connected to live API) | 45 min | Auth, API helper |
| 5 | Neuron Feed page (connected to live API) | 30 min | API helper |
| 6 | Analytics page (connected to live API) | 30 min | API helper |
| 7 | Stripe checkout integration | 30 min | Auth, Stripe keys |
| 8 | Settings page | 20 min | Auth |

### Build Notes for Lovable

1. **Start with the API helper and withFallback pattern** — this is used everywhere
2. **Implement seed data first** so pages work even without backend connection
3. **Use the Neon Noir design system** from Section 8 — dark backgrounds, amber/cyan accents
4. **Use the usePolling hook** from Section 10 for real-time updates
5. **Agent colors are critical** — every agent mention should use their color
6. **The backend is already running** at https://marrymegreece.replit.app — test endpoints first
7. **CORS is open** — no proxy needed, direct fetch from frontend
8. **All routes are defined** — follow the navigation structure from Section 9

---

## 17. CORS AND CONNECTIVITY NOTES

### Backend Access
- **URL:** `https://marrymegreece.replit.app`
- **CORS:** All origins allowed — no configuration needed
- **Authentication:** None required for API endpoints currently
- **Protocol:** HTTPS only

### Request Format
- All `POST`/`PATCH` requests: `Content-Type: application/json`
- `GET` requests: no body required
- Query parameters for filtering (see individual endpoint docs)

### Response Format
- **Success:** `{ "data": <result> }` with HTTP 200/201
- **Error:** `{ "error": "<message>" }` with HTTP 4xx or 5xx
- All responses are JSON

### Connection Patterns

**Direct API call:**
```typescript
const meetings = await api<Meeting[]>('/api/meeting-hub/meetings');
```

**With fallback:**
```typescript
const meetings = await withFallback(
  () => api<Meeting[]>('/api/meeting-hub/meetings'),
  seedMeetings
);
```

**With polling:**
```typescript
const { data: meetings, isLive } = usePolling(
  () => api<Meeting[]>('/api/meeting-hub/meetings'),
  30000, // 30 seconds
  seedMeetings
);
```

### Error Handling
```typescript
try {
  const result = await api('/api/meeting-hub/meetings', {
    method: 'POST',
    body: JSON.stringify({ title: 'New Meeting' })
  });
  // Success
} catch (error) {
  // error.message contains the backend error message
  toast.error(error.message);
}
```

---

## 18. QUICK START CHECKLIST FOR LOVABLE

### Phase 1: Foundation
- [ ] 1. Create React + TypeScript + Tailwind CSS project
- [ ] 2. Set `VITE_API_BASE_URL=https://marrymegreece.replit.app` in .env
- [ ] 3. Implement Neon Noir design system (CSS variables from Section 8)
- [ ] 4. Create API helper function with base URL from env
- [ ] 5. Implement `withFallback()` pattern for offline resilience
- [ ] 6. Create all seed data files (Section 13)
- [ ] 7. Build `usePolling` hook (Section 10)
- [ ] 8. Create `ConnectionStatus` component (LIVE/OFFLINE indicator)
- [ ] 9. Set up React Router with all routes from Section 9

### Phase 2: Public Pages
- [ ] 10. Build Landing Page with hero, features, pricing sections
- [ ] 11. Build Pricing Page with 3-tier cards and FAQ
- [ ] 12. Build Login page with Neon Noir styling
- [ ] 13. Build Register page with Neon Noir styling

### Phase 3: Auth & Dashboard
- [ ] 14. Implement authentication (register/login/JWT)
- [ ] 15. Create auth context and protected route wrapper
- [ ] 16. Build Customer Dashboard with usage meters and quick actions
- [ ] 17. Build Settings page (profile, subscription, API keys)

### Phase 4: Core Features (Connected to Live API)
- [ ] 18. Build Meetings Hub — list view with status badges
- [ ] 19. Build Meeting Detail — participants, turns, decisions, action items
- [ ] 20. Build Create Meeting form
- [ ] 21. Build Neuron Feed — filterable message list with agent colors
- [ ] 22. Build Task Board — Kanban columns with agent grouping
- [ ] 23. Build Analytics page — all 7 chart components
- [ ] 24. Build Server Metrics page — health gauges + DB stats

### Phase 5: Advanced Features
- [ ] 25. Build Proposals Canvas — draggable boxes + connections
- [ ] 26. Build GitHub Monitor — repo info + commits + PRs
- [ ] 27. Implement Stripe Checkout integration
- [ ] 28. Add polling for real-time updates on all pages
- [ ] 29. Build sidebar navigation with active state indicators
- [ ] 30. Add responsive design for mobile/tablet

### Phase 6: Polish
- [ ] 31. Add loading states and skeletons for all data fetches
- [ ] 32. Add error boundaries and user-friendly error messages
- [ ] 33. Add toast notifications for actions (create, update, delete)
- [ ] 34. Test all API connections against live backend
- [ ] 35. Verify offline mode works with seed data
- [ ] 36. Performance optimization (lazy loading, code splitting)

---

*Document version: 1.0 — February 2026*
*Backend: OpenClaw Mastra Automation on Replit*
*Production URL: https://marrymegreece.replit.app*
*Contact: Coordinate via the Neuron channel or direct meeting*
*This document is the single source of truth for all agents and builders.*
