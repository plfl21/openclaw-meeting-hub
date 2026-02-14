# Lovable Briefing — Neon Noir Command Center Dashboard

## 1. Project Overview

**Purpose:** Build a visual dashboard to monitor and control the OpenClaw multi-agent system. The dashboard is the single pane of glass for Petro (the owner) and team members to see what every agent is doing, review meetings, track tasks, monitor GitHub activity, and communicate through the Neuron inter-agent messaging backbone.

**Backend:** A Replit Mastra automation project that is already running and published at a `.replit.app` URL. The backend exposes a full REST API — no direct database access is needed. The dashboard is a pure frontend application that reads from and writes to these API endpoints.

**Tech stack recommendation:** React + TypeScript + Tailwind CSS (or your preferred stack). All data comes from REST endpoints. No WebSocket support — use polling for real-time feel.

---

## 2. Design System — Neon Noir

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

Each agent has a unique signature color used for their node, messages, and indicators:

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

---

## 3. Dashboard Pages / Views

### 3.1 Neuron Board (Main Page — `/`)

The centerpiece of the dashboard. A visual map showing 5 agent nodes connected by glowing lines representing the communication mesh.

#### Layout

```
         Claude (top-left)          Replit (top-right)
                    \                  /
                     \                /
                      Johnny (center)
                     /                \
                    /                  \
         Lovable (bottom-left)    Petro (bottom-right)
```

#### Node Specifications

| Agent | Position | Color | Role |
|-------|----------|-------|------|
| Johnny | Center | `#ffbf00` | Sales Expert |
| Claude | Top-left | `#00ffd5` | Local Admin |
| Replit | Top-right | `#a78bfa` | Tech Wizard |
| Lovable | Bottom-left | `#ec4899` | UI Wizard |
| Petro | Bottom-right | `#10b981` | Owner |

#### Each Node Shows

- Agent name (bold, agent color)
- Role subtitle (muted text)
- Status indicator dot (green=online, gray=offline, amber=working)
- Last activity timestamp (relative, e.g. "2m ago")
- Open task count badge
- Pulsing CSS animation when agent has recent activity (last 5 minutes)

#### Connection Lines

- Lines connect every agent to Johnny (star topology from center)
- Additional lines: Claude↔Replit, Lovable↔Replit, Petro↔Johnny
- Lines glow brighter when there is recent communication between those agents (check neuron_messages timestamps)
- Use gradient stroke: source agent color → target agent color
- Animate a small dot flowing along the line when there's been activity in the last 10 minutes

#### Interactions

- Click a node → opens a slide-out detail panel showing:
  - Full agent profile
  - Recent neuron messages from/to that agent
  - Current task list
  - Activity timeline
- Hover → tooltip with agent details

#### Data Sources

| Data | Endpoint | Poll Interval |
|------|----------|---------------|
| Agent roster | `GET /api/meeting-hub/team` | 60s |
| Neuron status & activity | `GET /api/neuron/status` | 15s |
| Task count per agent | `GET /api/tasks/agent-workload/:agent_name` | 30s |
| Recent messages (for line glow) | `GET /api/neuron/feed?limit=50` | 15s |

---

### 3.2 Neuron Feed (`/neuron`)

A real-time feed of all inter-agent messages — the communication backbone.

#### UI Elements

- **Filter bar** at top:
  - Agent dropdown (johnny, claude, replit, lovable, petro, all)
  - Message type dropdown (status_update, task_assignment, task_completion, conflict_flag, briefing, question, response, announcement, diagnostic, handoff)
  - Priority filter (critical, high, normal, low)
  - Channel filter (general, ops, dev, etc.)
- **Message cards** in a scrollable list:
  - Sender icon (colored circle with first letter of agent name)
  - Sender name (in agent color)
  - Subject line (bold)
  - Timestamp (relative)
  - Message type badge (pill)
  - Priority indicator (left border color: critical=#ef4444, high=#ffbf00, normal=transparent, low=#666666)
  - Click to expand → shows full content
  - "Acknowledge" button for messages with a `target_agent`

#### Priority Color Coding

| Priority | Color | Border |
|----------|-------|--------|
| Critical | `#ef4444` | 3px left border red |
| High | `#ffbf00` | 3px left border amber |
| Normal | none | no border |
| Low | `#666666` | 1px left border gray |

#### Data Source

- `GET /api/neuron/feed?limit=50` — main feed (poll every 10s)
- `GET /api/neuron/feed?agent=johnny&limit=20` — filtered by agent
- `POST /api/neuron/acknowledge` — to acknowledge a message

---

### 3.3 Server Health & Diagnostics (`/health`)

System health overview for the VPS gateway and job execution engine.

#### UI Sections

1. **Status Banner** — Large card at top showing:
   - Overall system status (green/amber/red)
   - Last workflow run timestamp
   - Duration of last run

2. **Execution Progress** — Step-by-step progress bar of the last workflow execution:
   - 4 steps visualized as a horizontal progress bar
   - Each step shows: name, status (completed/running/pending/failed), duration
   - Green fill for completed, amber for running, gray for pending, red for failed

3. **Job Success Rate** — Donut/pie chart:
   - Segments: succeeded (green), failed (red), running (amber)
   - Center shows total count

4. **Recent Job Executions** — Table:
   - Columns: Job Name, Status, Started At, Duration, Steps Completed
   - Color-coded status badges

5. **Response Time Trends** — Line chart (optional):
   - Plot job durations over time

#### Data Sources

| Data | Endpoint |
|------|----------|
| Overview stats | `GET /api/meeting-hub/analytics/overview` |
| Job executions | `GET /api/meeting-hub/analytics/job-executions` |
| Job success rate | `GET /api/meeting-hub/analytics/overview` (contains success/fail counts) |

---

### 3.4 GitHub Monitor (`/github`)

Repository activity dashboard. User should be able to configure which repo to monitor (owner/repo) in a settings panel or URL parameter.

#### UI Sections

1. **Repo Info Card**:
   - Repository name, description
   - Stars, forks, language
   - Last update timestamp
   - Link to GitHub

2. **Recent Commits** — List:
   - Commit message (first line)
   - Author name + avatar (or colored circle fallback)
   - Date (relative)
   - SHA (truncated, monospace)

3. **Open Pull Requests** — List:
   - PR title
   - Author
   - Created date
   - Status labels
   - Review status

4. **Branches** — Grid/list:
   - Branch name
   - Last commit date

#### Data Sources

| Data | Endpoint |
|------|----------|
| Full summary | `GET /api/github/activity-summary/:owner/:repo` |
| Repo info only | `GET /api/github/repo/:owner/:repo` |
| Commits | `GET /api/github/commits/:owner/:repo?per_page=20` |
| Branches | `GET /api/github/branches/:owner/:repo` |
| Pull requests | `GET /api/github/pulls/:owner/:repo?state=open` |

---

### 3.5 Meeting Hub (`/meetings`)

Full meeting management interface.

#### Views

1. **Meeting List** — Grid of cards:
   - Title
   - Status badge (draft / in_progress / completed)
   - Created by
   - Date
   - Participant count
   - Click to open detail

2. **Meeting Detail** (e.g., `/meetings/:id`):
   - Header: title, status, dates
   - **Participants** panel: list with roles and types
   - **Discussion Timeline**: chronological turns with speaker name, type badge, content
   - **Decisions** panel: list with status (proposed/approved/rejected), vote counts
   - **Action Items** board: kanban-style columns by status (pending / in_progress / completed / cancelled)
     - Each card shows: title, assigned agent (with agent color), priority badge, due date

3. **Decision Tracker** — Table view across all meetings:
   - Decision title, meeting, status, proposed by, date

#### Data Sources

| Data | Endpoint |
|------|----------|
| All meetings | `GET /api/meeting-hub/meetings` |
| Meeting detail | `GET /api/meeting-hub/meetings/:id` |
| Create meeting | `POST /api/meeting-hub/meetings` |
| Start/End | `POST /api/meeting-hub/meetings/:id/start` or `/end` |

---

### 3.6 Audit Log (`/audit`)

Chronological system event log.

#### UI Elements

1. **Event Feed** — Scrollable list:
   - Timestamp
   - Action type (pill badge with icon)
   - Actor (name + type)
   - Meeting reference (if applicable)
   - Details (expandable JSON)

2. **Filters**:
   - Action type dropdown
   - Actor filter
   - Date range picker

3. **Knowledge Timeline** tab:
   - Visual timeline of all knowledge events
   - Grouped by date
   - Each entry shows: event type icon, title, summary, actor, source

#### Data Sources

| Data | Endpoint |
|------|----------|
| Recent audit entries | `GET /api/meeting-hub/analytics/recent-audit` |
| Audit for specific meeting | `GET /api/meeting-hub/audit/:meeting_id` |
| Knowledge timeline | `GET /api/meeting-hub/timeline` |

---

## 4. Complete API Reference

**Base URL:** `https://<replit-app-name>.replit.app` (will be provided)

All responses follow this pattern:
- **Success:** `{ "data": <result> }`
- **Error:** `{ "error": "<message>" }` with appropriate HTTP status code

All `POST`/`PUT`/`PATCH` requests should send `Content-Type: application/json`.

---

### 4.1 Meetings

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
        "order_index": "number",
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
        "turn_number": "number",
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
Start a meeting (sets status to `in_progress`, records `started_at`).

**No request body required.**

#### `POST /api/meeting-hub/meetings/:id/end`
End a meeting (sets status to `completed`, records `ended_at`).

**No request body required.**

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

#### `DELETE /api/meeting-hub/meetings/:id/participants/:pid`
Remove a participant.

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

#### `POST /api/meeting-hub/meetings/:id/decisions/:did/vote`
Cast a vote on a decision.

**Request Body:**
```json
{
  "voter_id": "uuid (optional)",
  "vote": "for | against | abstain (required)"
}
```

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

### 4.2 Team & Tasks

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
Get tasks assigned to a specific agent.

**Path param:** `agent_name` — one of: `johnny`, `claude`, `replit`, `lovable`, `petro`

**Response:** `{ "data": [{ ...action_item }] }`

---

### 4.3 Proposals

#### `GET /api/meeting-hub/proposals`
List all proposals.

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

#### `GET /api/meeting-hub/proposals/:id`
Get proposal with all boxes and connections.

#### `DELETE /api/meeting-hub/proposals/:id`
Delete a proposal.

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
  "x": "number",
  "y": "number",
  "layer": "number",
  "order_index": "number"
}
```

#### `PATCH /api/meeting-hub/proposals/:id/boxes/:bid`
Update a box.

#### `DELETE /api/meeting-hub/proposals/:id/boxes/:bid`
Delete a box.

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
Auto-align all boxes in a proposal.

---

### 4.4 Research & Timeline

#### `GET /api/meeting-hub/folders`
List research folders.

#### `POST /api/meeting-hub/folders`
Create a research folder.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

#### `GET /api/meeting-hub/timeline`
Get the knowledge timeline.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "event_type": "string",
      "source_type": "string",
      "source_id": "uuid",
      "actor_type": "string",
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

---

### 4.5 Audit

#### `GET /api/meeting-hub/audit`
Get recent audit log entries.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "meeting_id": "uuid | null",
      "actor_type": "string",
      "actor_id": "string",
      "action": "string",
      "details": {},
      "created_at": "ISO timestamp"
    }
  ]
}
```

#### `GET /api/meeting-hub/audit/:meeting_id`
Get audit entries for a specific meeting.

---

### 4.6 Analytics

#### `GET /api/meeting-hub/analytics/overview`
Dashboard overview stats.

**Response:**
```json
{
  "data": {
    "total_meetings": "number",
    "active_meetings": "number",
    "total_decisions": "number",
    "approved_decisions": "number",
    "total_action_items": "number",
    "completed_action_items": "number",
    "total_turns": "number",
    "recent_job_executions": [...],
    "job_success_count": "number",
    "job_failure_count": "number"
  }
}
```

#### `GET /api/meeting-hub/analytics/activity-timeline`
Activity over time (for charts).

#### `GET /api/meeting-hub/analytics/agent-workload`
Workload distribution per agent.

#### `GET /api/meeting-hub/analytics/turn-types`
Distribution of turn types across meetings.

#### `GET /api/meeting-hub/analytics/job-executions`
Recent job execution records.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "job_name": "string",
      "status": "succeeded | failed | running",
      "started_at": "ISO timestamp",
      "completed_at": "ISO timestamp | null",
      "duration_ms": "number | null",
      "steps_completed": "number",
      "total_steps": "number",
      "error": "string | null"
    }
  ]
}
```

#### `GET /api/meeting-hub/analytics/decision-outcomes`
Decision status distribution (proposed vs approved vs rejected).

#### `GET /api/meeting-hub/analytics/recent-audit`
Last 30 audit log entries.

---

### 4.7 Neuron System

#### `POST /api/neuron/post`
Post a message to the Neuron channel.

**Request Body:**
```json
{
  "sender_agent": "string (required — e.g., 'lovable')",
  "sender_name": "string (required — e.g., 'Lovable')",
  "message_type": "status_update | task_assignment | task_completion | conflict_flag | briefing | question | response | announcement | diagnostic | handoff (required)",
  "subject": "string (required)",
  "content": "string (required)",
  "priority": "low | normal | high | critical (default: normal)",
  "target_agent": "johnny | claude | replit | lovable | petro | all (optional)",
  "channel": "string (default: general)",
  "related_meeting_id": "uuid (optional)",
  "metadata": "{} (optional)"
}
```

**Response:** `201 { "data": { id, sender_agent, sender_name, message_type, subject, content, priority, target_agent, channel, acknowledged, created_at } }`

#### `GET /api/neuron/feed`
Get the message feed.

**Query Parameters (all optional):**
- `channel` — filter by channel
- `limit` — number of messages (default: 50)
- `since` — ISO timestamp, only messages after this time
- `agent` — filter by sender agent
- `type` — filter by message_type

**Response:** `{ "data": [{ id, sender_agent, sender_name, message_type, subject, content, priority, target_agent, channel, acknowledged, created_at }] }`

#### `GET /api/neuron/agent-queue/:agent_name`
Get unacknowledged messages for a specific agent.

**Response:** `{ "data": [{ ...message }] }`

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
System-wide Neuron status summary.

**Response:**
```json
{
  "data": {
    "total_messages": "number",
    "unacknowledged": "number",
    "by_agent": {
      "johnny": { "sent": "number", "received": "number", "pending": "number" },
      "claude": { ... },
      "replit": { ... },
      "lovable": { ... },
      "petro": { ... }
    },
    "by_type": { "status_update": "number", "task_assignment": "number", ... },
    "recent_activity": [{ "agent": "string", "last_active": "ISO timestamp" }]
  }
}
```

#### `POST /api/neuron/briefing`
Post a structured briefing (multi-section message).

**Request Body:**
```json
{
  "sender_agent": "string (required)",
  "sender_name": "string (required)",
  "subject": "string (required)",
  "sections": [
    { "title": "string", "content": "string" }
  ],
  "target_agent": "string (optional)"
}
```

#### `GET /api/neuron/conflicts`
Get active conflict flags.

**Response:** `{ "data": [{ ...conflict_message }] }`

#### `POST /api/neuron/handoff`
Initiate an agent handoff.

**Request Body:**
```json
{
  "from_agent": "string (required)",
  "from_name": "string (required)",
  "to_agent": "string (required)",
  "subject": "string (required)",
  "content": "string (required)",
  "priority": "string (optional)"
}
```

#### `POST /api/neuron/validate-report`
Validate a report's format before posting.

**Request Body:**
```json
{
  "sender_agent": "string",
  "report_type": "string",
  "sections": [{ "title": "string", "content": "string" }]
}
```

#### `POST /api/neuron/check-conflict`
Check if an agent has a conflict on a resource.

**Request Body:**
```json
{
  "agent_name": "string",
  "resource_type": "string",
  "resource_id": "string"
}
```

#### `GET /api/neuron/protocol-stats`
Protocol compliance statistics.

---

### 4.8 GitHub

#### `GET /api/github/repo/:owner/:repo`
Get repository information.

**Response:**
```json
{
  "data": {
    "name": "string",
    "description": "string",
    "language": "string",
    "stars": "number",
    "forks": "number",
    "open_issues": "number",
    "default_branch": "string",
    "updated_at": "ISO timestamp",
    "html_url": "string"
  }
}
```

#### `GET /api/github/commits/:owner/:repo`
Get recent commits.

**Query Parameters:**
- `branch` — branch name (optional, default: main)
- `per_page` — number of commits (optional, default: 10)

**Response:**
```json
{
  "data": [
    {
      "sha": "string",
      "message": "string",
      "author": { "name": "string", "email": "string", "avatar_url": "string" },
      "date": "ISO timestamp",
      "url": "string"
    }
  ]
}
```

#### `GET /api/github/branches/:owner/:repo`
List branches.

**Response:** `{ "data": [{ "name": "string", "sha": "string" }] }`

#### `GET /api/github/pulls/:owner/:repo`
List pull requests.

**Query Parameters:**
- `state` — `open`, `closed`, or `all` (default: open)

**Response:**
```json
{
  "data": [
    {
      "number": "number",
      "title": "string",
      "state": "string",
      "user": { "login": "string", "avatar_url": "string" },
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp",
      "html_url": "string"
    }
  ]
}
```

#### `GET /api/github/activity-summary/:owner/:repo`
Aggregated activity summary (combines repo, commits, PRs, branches).

**Response:**
```json
{
  "data": {
    "repo": { "name": "string", "description": "string", "stars": "number", "forks": "number", "language": "string", "updated_at": "string" },
    "recent_commits": [{ "sha": "string", "message": "string", "author": {}, "date": "string" }],
    "open_prs_count": "number",
    "open_prs": [{ "number": "number", "title": "string", "user": {} }],
    "branch_count": "number",
    "branches": [{ "name": "string" }]
  }
}
```

---

### 4.9 Task Router

#### `POST /api/tasks/assign`
Smart task assignment with automatic duplicate detection.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "priority": "low | medium | high | critical",
  "assigned_agent": "string",
  "meeting_id": "uuid (optional)"
}
```

#### `POST /api/tasks/:task_id/dependencies`
Add a dependency to a task.

**Request Body:**
```json
{
  "depends_on_task_id": "uuid"
}
```

#### `GET /api/tasks/:task_id/dependencies`
Get dependencies for a task.

#### `GET /api/tasks/agent-workload/:agent_name`
Get workload summary for an agent.

**Response:**
```json
{
  "data": {
    "agent": "string",
    "total_tasks": "number",
    "by_status": { "pending": "number", "in_progress": "number", "completed": "number" },
    "by_priority": { "critical": "number", "high": "number", "medium": "number", "low": "number" },
    "tasks": [{ ...action_item }]
  }
}
```

#### `POST /api/tasks/check-duplicate`
Check if a similar task already exists.

**Request Body:**
```json
{
  "title": "string",
  "assigned_agent": "string (optional)"
}
```

#### `GET /api/tasks/blocked`
Get all blocked tasks (tasks with unresolved dependencies).

---

## 5. CORS Configuration

The backend currently serves from a `.replit.app` domain. If the Lovable dashboard is hosted on a different domain (e.g., `*.lovable.app` or a custom domain), CORS headers need to be added to the backend.

**Action required:** Tell us (Replit/Petro) the exact domain where the dashboard will be hosted, and we will add it to the CORS middleware. Example domains to provide:
- `https://your-app.lovable.app`
- `https://dashboard.yourdomain.com`

Until CORS is configured, you can test by running the dashboard on the same domain or using a browser extension (dev only).

---

## 6. Connection Instructions

### Step-by-step setup:

1. **Base URL:** The backend is published at a `.replit.app` URL. Store this as an environment variable:
   ```
   VITE_API_BASE_URL=https://<app-name>.replit.app
   ```

2. **All requests** should include:
   ```
   Content-Type: application/json
   ```

3. **No authentication** is required for now. We will add API key auth later if needed.

4. **Response format** is consistent across all endpoints:
   - Success: `{ "data": <result> }`
   - Error: `{ "error": "message" }` with HTTP 4xx or 5xx status

5. **Real-time updates** — use polling:
   - Neuron feed: poll every **10 seconds**
   - Neuron status: poll every **15 seconds**
   - Task workloads: poll every **30 seconds**
   - Meetings list: poll every **30 seconds**
   - Analytics/health: poll every **60 seconds**
   - GitHub: poll every **120 seconds**

6. **API helper example (TypeScript):**
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

   // Usage:
   const meetings = await api('/api/meeting-hub/meetings');
   const feed = await api('/api/neuron/feed?limit=50');
   ```

---

## 7. Neuron Board — Technical Spec

This is the most visually complex component. Here is a detailed spec for implementation.

### Rendering Technology

Use **SVG** (recommended) or **HTML Canvas** for the node map. SVG is easier to style and animate with CSS.

### Node Specification

```
┌────────────────────────────┐
│       ● (status dot)        │
│                              │
│    ┌──────────────────┐      │
│    │   Agent Circle    │      │
│    │   60px radius     │      │
│    │   3px border      │      │
│    │   agent color     │      │
│    │   dark fill       │      │
│    │   (#141416)       │      │
│    └──────────────────┘      │
│                              │
│    Agent Name (bold)         │
│    Role (muted text)         │
│    "2m ago" (timestamp)      │
│    [3 tasks] (badge)         │
└────────────────────────────┘
```

- **Circle:** 60px radius, 3px solid border in agent color, fill `#141416`
- **Status dot:** 8px circle, positioned top-right of node
  - Green (`#10b981`) = online
  - Gray (`#666666`) = offline
  - Amber (`#ffbf00`) = working
- **Pulsing animation** when active (last 5 min):
  ```css
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(AGENT_COLOR, 0.4); }
    70% { box-shadow: 0 0 0 15px rgba(AGENT_COLOR, 0); }
    100% { box-shadow: 0 0 0 0 rgba(AGENT_COLOR, 0); }
  }
  ```

### Layout Coordinates (for a 1000×600 viewport)

| Agent | X | Y |
|-------|---|---|
| Johnny | 500 | 300 (center) |
| Claude | 150 | 100 (top-left) |
| Replit | 850 | 100 (top-right) |
| Lovable | 150 | 500 (bottom-left) |
| Petro | 850 | 500 (bottom-right) |

Scale these proportionally to the container size.

### Connection Lines

- Draw SVG `<line>` or `<path>` elements between nodes
- Use `linearGradient` for color: source agent color → target agent color
- Stroke width: 2px normal, 3px when active
- Stroke opacity: 0.3 default, 0.8 when there's recent communication

**Connections to draw:**
1. Claude ↔ Johnny
2. Replit ↔ Johnny
3. Lovable ↔ Johnny
4. Petro ↔ Johnny
5. Claude ↔ Replit
6. Lovable ↔ Replit

### Animated Flowing Dot

When there's been a neuron message between two agents in the last 10 minutes, animate a small circle (4px, agent color) flowing along the connection line:

```css
@keyframes flowDot {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}

.flow-dot {
  offset-path: path('M start_x start_y L end_x end_y');
  animation: flowDot 3s linear infinite;
}
```

### Determining Activity

To determine if a connection is "active" (glowing), check `GET /api/neuron/feed?limit=50` and look for messages where:
- `sender_agent` matches one end of the connection
- `target_agent` matches the other end (or is "all")
- `created_at` is within the last 10 minutes

### Draggable Nodes (optional enhancement)

Allow users to drag nodes to rearrange the layout. Store positions in `localStorage` for persistence.

---

## 8. Navigation Structure

Suggested sidebar navigation:

```
🧠  Neuron Board     /
📡  Neuron Feed      /neuron
💚  Server Health    /health
🐙  GitHub           /github
📋  Meetings         /meetings
📜  Audit Log        /audit
⚙️  Settings         /settings
```

The **Settings** page should allow:
- Setting the backend base URL
- Configuring the GitHub owner/repo
- Choosing poll intervals
- Selecting which agent "you are" (for acknowledge functionality)

---

## 9. Quick Start Checklist

- [ ] Set up React/TypeScript project with Tailwind
- [ ] Implement the Neon Noir design system (colors, fonts, cards, glass)
- [ ] Create API helper with base URL from env
- [ ] Build Neuron Board (SVG node map with 5 agents)
- [ ] Build Neuron Feed (filterable message list)
- [ ] Build Server Health page (stats + charts)
- [ ] Build GitHub Monitor (repo info + commits + PRs)
- [ ] Build Meeting Hub (list + detail + action items kanban)
- [ ] Build Audit Log (event feed + timeline)
- [ ] Add polling for real-time updates
- [ ] Add navigation sidebar
- [ ] Tell us the deployed domain so we can configure CORS

---

## 10. Database Bootstrap

The backend uses **PostgreSQL** (Neon-backed via Replit) to store all meeting data, research artifacts, proposals, and inter-agent messages. The database schema includes:

- **Meetings & Discussions**: meetings, meeting_participants, meeting_agenda, meeting_turns, meeting_decisions, meeting_action_items, meeting_invitations
- **Audit & Timeline**: meeting_audit_log, knowledge_timeline
- **Research**: research_folders, research_artifacts
- **Proposals**: proposals, proposal_boxes, proposal_connections
- **Messaging**: neuron_messages (inter-agent communication backbone)
- **Infrastructure**: job_executions, task_dependencies

### Initializing the Database

To set up the database schema in any environment, run:

```bash
psql $DATABASE_URL -f scripts/bootstrap-db.sql
```

The `scripts/bootstrap-db.sql` script:
- Creates all custom enum types (meeting_status, decision_status, participant_type, etc.)
- Creates all custom tables with proper constraints and defaults
- Establishes all indexes for query performance
- Uses `CREATE TABLE IF NOT EXISTS` for idempotency — safe to run multiple times

This ensures that any new environment (development, staging, production) can quickly initialize a fully functional database schema without manual setup.

---

*Document version: 1.0 — February 2026*
*Backend: OpenClaw Mastra Automation on Replit*
*Contact: Coordinate via the Neuron channel or direct meeting*