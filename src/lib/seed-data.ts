export const seedServerHealth = {
  status: 'healthy',
  uptime_seconds: 86400,
  uptime_formatted: '1d 0h 0m',
  memory: { rss_mb: 120, heap_used_mb: 85, heap_total_mb: 128, external_mb: 12 },
  cpu: { user_ms: 45000, system_ms: 12000 },
  database: { connected: true, server_time: '2026-02-12T10:00:00.000Z', pg_version: '16.2' },
  table_counts: {
    meetings_count: '15', turns_count: '230', action_items_count: '45',
    decisions_count: '12', neuron_messages_count: '89', proposals_count: '3',
    job_executions_count: '67', audit_log_count: '320', timeline_entries_count: '150',
  },
  node_version: 'v20.11.0', platform: 'linux', env: 'development',
};

export const seedWorkflows = {
  summary: {
    total: '67', completed: '60', failed: '5', running: '2',
    avg_duration_ms: '4500', max_duration_ms: '12000', min_duration_ms: '800',
    success_rate_pct: 90, avg_duration_formatted: '5s',
  },
  by_status: [
    { status: 'completed', count: '60' },
    { status: 'failed', count: '5' },
    { status: 'running', count: '2' },
  ],
  recent_executions: [
    { id: 'ex-1', workflow_id: 'wf-1', workflow_name: 'johnny-workflow', run_id: 'run-1', status: 'completed', trigger_type: 'cron', started_at: '2026-02-12T09:00:00Z', completed_at: '2026-02-12T09:00:05Z', duration_ms: 4500, steps_completed: 4, steps_total: 4, error_message: null },
    { id: 'ex-2', workflow_id: 'wf-1', workflow_name: 'johnny-workflow', run_id: 'run-2', status: 'completed', trigger_type: 'cron', started_at: '2026-02-12T08:30:00Z', completed_at: '2026-02-12T08:30:03Z', duration_ms: 3200, steps_completed: 4, steps_total: 4, error_message: null },
    { id: 'ex-3', workflow_id: 'wf-1', workflow_name: 'johnny-workflow', run_id: 'run-3', status: 'failed', trigger_type: 'cron', started_at: '2026-02-12T08:00:00Z', completed_at: '2026-02-12T08:00:08Z', duration_ms: 8000, steps_completed: 2, steps_total: 4, error_message: 'Timeout reached' },
  ],
};

export const seedAnalyticsOverview = {
  meetings: { total: '15', active: '2', completed: '10', draft: '3' },
  turns: { total: '230' },
  decisions: { total: '12', approved: '8', rejected: '1', pending: '3' },
  actionItems: { total: '45', done: '20', pending: '15', in_progress: '10' },
  proposals: { total: '3' },
  jobs: { total: '67', completed: '60', failed: '5', running: '2', avg_duration_ms: '4500' },
};

export const seedActivityTimeline = [
  { day: '2026-01-14', turns: 5, meetings: 1, jobs: 3 },
  { day: '2026-01-15', turns: 12, meetings: 0, jobs: 5 },
  { day: '2026-01-16', turns: 8, meetings: 2, jobs: 4 },
  { day: '2026-01-17', turns: 15, meetings: 1, jobs: 6 },
  { day: '2026-01-18', turns: 3, meetings: 0, jobs: 2 },
  { day: '2026-01-19', turns: 0, meetings: 0, jobs: 1 },
  { day: '2026-01-20', turns: 10, meetings: 1, jobs: 7 },
  { day: '2026-01-21', turns: 18, meetings: 2, jobs: 5 },
  { day: '2026-01-22', turns: 7, meetings: 1, jobs: 3 },
  { day: '2026-01-23', turns: 22, meetings: 3, jobs: 8 },
  { day: '2026-01-24', turns: 14, meetings: 1, jobs: 4 },
  { day: '2026-01-25', turns: 9, meetings: 0, jobs: 6 },
  { day: '2026-01-26', turns: 1, meetings: 0, jobs: 2 },
  { day: '2026-01-27', turns: 16, meetings: 2, jobs: 5 },
  { day: '2026-01-28', turns: 20, meetings: 1, jobs: 9 },
  { day: '2026-01-29', turns: 11, meetings: 1, jobs: 3 },
  { day: '2026-01-30', turns: 6, meetings: 0, jobs: 4 },
  { day: '2026-01-31', turns: 13, meetings: 2, jobs: 7 },
  { day: '2026-02-01', turns: 19, meetings: 1, jobs: 5 },
  { day: '2026-02-02', turns: 4, meetings: 0, jobs: 3 },
  { day: '2026-02-03', turns: 17, meetings: 2, jobs: 6 },
  { day: '2026-02-04', turns: 21, meetings: 1, jobs: 8 },
  { day: '2026-02-05', turns: 10, meetings: 1, jobs: 4 },
  { day: '2026-02-06', turns: 8, meetings: 0, jobs: 5 },
  { day: '2026-02-07', turns: 15, meetings: 2, jobs: 7 },
  { day: '2026-02-08', turns: 12, meetings: 1, jobs: 3 },
  { day: '2026-02-09', turns: 5, meetings: 0, jobs: 2 },
  { day: '2026-02-10', turns: 18, meetings: 2, jobs: 6 },
  { day: '2026-02-11', turns: 14, meetings: 1, jobs: 5 },
  { day: '2026-02-12', turns: 9, meetings: 1, jobs: 4 },
];

export const seedAgentWorkload = [
  { agent: 'johnny', total: '12', done: '5', pending: '4', in_progress: '3' },
  { agent: 'claude', total: '8', done: '6', pending: '1', in_progress: '1' },
  { agent: 'replit', total: '10', done: '7', pending: '2', in_progress: '1' },
  { agent: 'lovable', total: '6', done: '3', pending: '2', in_progress: '1' },
  { agent: 'petro', total: '9', done: '4', pending: '3', in_progress: '2' },
];

export const seedTurnTypes = [
  { turn_type: 'statement', count: '120' },
  { turn_type: 'question', count: '45' },
  { turn_type: 'proposal', count: '20' },
  { turn_type: 'vote', count: '18' },
  { turn_type: 'summary', count: '15' },
  { turn_type: 'action', count: '12' },
];

export const seedDecisionOutcomes = [
  { status: 'approved', count: '8' },
  { status: 'proposed', count: '3' },
  { status: 'rejected', count: '1' },
];

export const seedJobExecutions = [
  { id: 'j1', workflow_id: 'wf-1', workflow_name: 'johnny-workflow', run_id: 'r1', status: 'completed', trigger_type: 'cron', started_at: '2026-02-12T09:00:00Z', completed_at: '2026-02-12T09:00:05Z', duration_ms: 4500, steps_completed: 4, steps_total: 4, step_results: {}, error_message: null, metadata: {} },
  { id: 'j2', workflow_id: 'wf-1', workflow_name: 'johnny-workflow', run_id: 'r2', status: 'completed', trigger_type: 'cron', started_at: '2026-02-12T08:30:00Z', completed_at: '2026-02-12T08:30:03Z', duration_ms: 3200, steps_completed: 4, steps_total: 4, step_results: {}, error_message: null, metadata: {} },
  { id: 'j3', workflow_id: 'wf-1', workflow_name: 'johnny-workflow', run_id: 'r3', status: 'failed', trigger_type: 'cron', started_at: '2026-02-12T08:00:00Z', completed_at: '2026-02-12T08:00:08Z', duration_ms: 8000, steps_completed: 2, steps_total: 4, step_results: {}, error_message: 'Timeout reached', metadata: {} },
];

export const seedMeetings = [
  { id: 'm1', title: 'Sprint Planning Q1', description: 'Plan deliverables for Q1 2026', status: 'completed', meeting_type: 'planning', current_phase: null, summary: 'Agreed on 5 key deliverables', created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-01T12:00:00Z', started_at: '2026-02-01T10:05:00Z', ended_at: '2026-02-01T12:00:00Z' },
  { id: 'm2', title: 'Agent Coordination Standup', description: 'Daily standup for agent team', status: 'in_progress', meeting_type: 'standup', current_phase: 'discussion', summary: null, created_at: '2026-02-12T09:00:00Z', updated_at: '2026-02-12T09:30:00Z', started_at: '2026-02-12T09:00:00Z', ended_at: null },
  { id: 'm3', title: 'Architecture Review', description: 'Review API architecture decisions', status: 'draft', meeting_type: 'review', current_phase: null, summary: null, created_at: '2026-02-10T14:00:00Z', updated_at: '2026-02-10T14:00:00Z', started_at: null, ended_at: null },
  { id: 'm4', title: 'Sales Strategy Brainstorm', description: 'Brainstorm new sales approaches', status: 'completed', meeting_type: 'brainstorm', current_phase: null, summary: 'Identified 3 new market segments', created_at: '2026-02-05T11:00:00Z', updated_at: '2026-02-05T13:00:00Z', started_at: '2026-02-05T11:05:00Z', ended_at: '2026-02-05T13:00:00Z' },
  { id: 'm5', title: 'UI/UX Design Decision', description: 'Decide on dashboard layout', status: 'completed', meeting_type: 'decision', current_phase: null, summary: 'Approved Neon Noir design system', created_at: '2026-02-03T15:00:00Z', updated_at: '2026-02-03T16:30:00Z', started_at: '2026-02-03T15:00:00Z', ended_at: '2026-02-03T16:30:00Z' },
];

export const seedMeetingDetail = {
  id: 'm2',
  title: 'Agent Coordination Standup',
  description: 'Daily standup for agent team',
  status: 'in_progress',
  meeting_type: 'standup',
  current_phase: 'discussion',
  summary: null,
  created_at: '2026-02-12T09:00:00Z',
  updated_at: '2026-02-12T09:30:00Z',
  started_at: '2026-02-12T09:00:00Z',
  ended_at: null,
  participants: [
    { id: 'p1', meeting_id: 'm2', participant_type: 'agent', display_name: 'Johnny', role: 'Sales Expert', role_instructions: null, agent_id: 'johnny', agent_endpoint: null, joined_at: '2026-02-12T09:00:00Z' },
    { id: 'p2', meeting_id: 'm2', participant_type: 'agent', display_name: 'Claude', role: 'Local Admin', role_instructions: null, agent_id: 'claude', agent_endpoint: null, joined_at: '2026-02-12T09:00:00Z' },
    { id: 'p3', meeting_id: 'm2', participant_type: 'agent', display_name: 'Replit', role: 'Tech Wizard', role_instructions: null, agent_id: 'replit', agent_endpoint: null, joined_at: '2026-02-12T09:01:00Z' },
    { id: 'p4', meeting_id: 'm2', participant_type: 'human', display_name: 'Petro', role: 'Owner', role_instructions: null, agent_id: 'petro', agent_endpoint: null, joined_at: '2026-02-12T09:02:00Z' },
  ],
  agenda: [
    { id: 'a1', title: 'Yesterday recap', description: 'What did each agent accomplish?', order_index: 0, duration_minutes: 10, status: 'completed' },
    { id: 'a2', title: 'Today goals', description: 'What will each agent work on today?', order_index: 1, duration_minutes: 10, status: 'in_progress' },
    { id: 'a3', title: 'Blockers', description: 'Any blockers or dependencies?', order_index: 2, duration_minutes: 5, status: 'pending' },
  ],
  turns: [
    { id: 't1', participant_id: 'p1', turn_type: 'statement', content: 'Yesterday I completed 3 lead qualification calls and updated the CRM pipeline.', phase: 'discussion', turn_number: 1, created_at: '2026-02-12T09:05:00Z' },
    { id: 't2', participant_id: 'p2', turn_type: 'statement', content: 'I performed system maintenance, updated SSL certificates, and ran backup verification.', phase: 'discussion', turn_number: 2, created_at: '2026-02-12T09:07:00Z' },
    { id: 't3', participant_id: 'p3', turn_type: 'statement', content: 'Deployed API v2.3, fixed 2 critical bugs in the meeting hub endpoint, and optimized database queries.', phase: 'discussion', turn_number: 3, created_at: '2026-02-12T09:09:00Z' },
    { id: 't4', participant_id: 'p4', turn_type: 'question', content: 'What is the current API response time after the optimization?', phase: 'discussion', turn_number: 4, created_at: '2026-02-12T09:11:00Z' },
    { id: 't5', participant_id: 'p3', turn_type: 'statement', content: 'Average response time dropped from 450ms to 120ms after query optimization.', phase: 'discussion', turn_number: 5, created_at: '2026-02-12T09:12:00Z' },
  ],
  decisions: [
    { id: 'd1', proposed_by: 'p3', title: 'Migrate to connection pooling', description: 'Switch from direct connections to PgBouncer for better performance', status: 'approved', created_at: '2026-02-12T09:15:00Z' },
    { id: 'd2', proposed_by: 'p1', title: 'Launch email campaign Q1', description: 'Send targeted emails to qualified leads', status: 'proposed', created_at: '2026-02-12T09:20:00Z' },
  ],
  action_items: [
    { id: 'ai1', assigned_to: 'p3', title: 'Set up PgBouncer', description: 'Configure connection pooling', priority: 'high', status: 'in_progress', assigned_agent: 'replit', due_date: '2026-02-14T00:00:00Z', created_at: '2026-02-12T09:16:00Z' },
    { id: 'ai2', assigned_to: 'p1', title: 'Draft email templates', description: 'Create 3 email templates for Q1 campaign', priority: 'medium', status: 'pending', assigned_agent: 'johnny', due_date: '2026-02-15T00:00:00Z', created_at: '2026-02-12T09:21:00Z' },
    { id: 'ai3', assigned_to: 'p2', title: 'Update firewall rules', description: 'Add new IP ranges to whitelist', priority: 'high', status: 'completed', assigned_agent: 'claude', due_date: '2026-02-13T00:00:00Z', created_at: '2026-02-12T09:08:00Z' },
    { id: 'ai4', assigned_to: 'p4', title: 'Review Q1 budget', description: 'Approve budget allocation for infrastructure', priority: 'critical', status: 'pending', assigned_agent: 'petro', due_date: '2026-02-16T00:00:00Z', created_at: '2026-02-12T09:22:00Z' },
  ],
};

export const seedNeuronFeed = [
  { id: 'n1', sender_agent: 'johnny', sender_name: 'Johnny', message_type: 'status_update', subject: 'Daily briefing complete', content: 'All systems operational. Completed 3 lead calls, updated CRM with new prospects. Pipeline value increased by $12,000.', priority: 'normal', target_agent: 'all', channel: 'general', related_meeting_id: null, related_task_id: null, metadata: {}, acknowledged_by: [], created_at: '2026-02-12T09:30:00Z' },
  { id: 'n2', sender_agent: 'claude', sender_name: 'Claude', message_type: 'diagnostic', subject: 'System health check', content: 'Server health nominal. Memory usage at 66%. All SSL certificates valid. Next backup scheduled in 4 hours.', priority: 'low', target_agent: 'all', channel: 'general', related_meeting_id: null, related_task_id: null, metadata: {}, acknowledged_by: [], created_at: '2026-02-12T09:15:00Z' },
  { id: 'n3', sender_agent: 'replit', sender_name: 'Replit', message_type: 'task_completion', subject: 'API v2.3 deployed', content: 'Successfully deployed API v2.3 with performance optimizations. Response time improved by 73%. Zero downtime deployment.', priority: 'high', target_agent: 'all', channel: 'general', related_meeting_id: null, related_task_id: null, metadata: {}, acknowledged_by: ['johnny'], created_at: '2026-02-12T08:45:00Z' },
  { id: 'n4', sender_agent: 'lovable', sender_name: 'Lovable', message_type: 'announcement', subject: 'Dashboard v2 ready for review', content: 'The new Neon Noir dashboard design is ready for team review. Includes glassmorphism cards, agent-colored indicators, and responsive layout.', priority: 'normal', target_agent: 'petro', channel: 'general', related_meeting_id: null, related_task_id: null, metadata: {}, acknowledged_by: [], created_at: '2026-02-12T08:30:00Z' },
  { id: 'n5', sender_agent: 'petro', sender_name: 'Petro', message_type: 'task_assignment', subject: 'Priority: Q1 deliverables review', content: 'All agents: please prepare your Q1 deliverable summaries by end of day. I need status reports for the board meeting tomorrow.', priority: 'critical', target_agent: 'all', channel: 'general', related_meeting_id: null, related_task_id: null, metadata: {}, acknowledged_by: ['johnny', 'claude'], created_at: '2026-02-12T08:00:00Z' },
  { id: 'n6', sender_agent: 'johnny', sender_name: 'Johnny', message_type: 'question', subject: 'Sales deck update needed?', content: 'Should we update the sales deck with the new API v2.3 performance metrics? The 73% improvement is a strong selling point.', priority: 'normal', target_agent: 'petro', channel: 'general', related_meeting_id: null, related_task_id: null, metadata: {}, acknowledged_by: [], created_at: '2026-02-12T09:00:00Z' },
  { id: 'n7', sender_agent: 'replit', sender_name: 'Replit', message_type: 'conflict_flag', subject: 'Database migration conflict', content: 'Detected conflicting migration scripts from Claude and Johnny. Need resolution before next deployment. Files: 002_add_leads.sql and 002_update_schema.sql', priority: 'high', target_agent: 'all', channel: 'general', related_meeting_id: null, related_task_id: null, metadata: {}, acknowledged_by: [], created_at: '2026-02-11T16:00:00Z' },
  { id: 'n8', sender_agent: 'claude', sender_name: 'Claude', message_type: 'briefing', subject: 'Weekly infrastructure report', content: 'Infrastructure Summary:\n- Uptime: 99.97%\n- Avg response time: 120ms\n- Database size: 50MB\n- Active connections: 12\n- SSL: Valid until 2027-01-01', priority: 'normal', target_agent: 'all', channel: 'general', related_meeting_id: null, related_task_id: null, metadata: {}, acknowledged_by: ['petro'], created_at: '2026-02-11T09:00:00Z' },
];

export const seedNeuronStatus = {
  total_messages_24h: 25,
  messages_by_type: [
    { message_type: 'status_update', count: '10' },
    { message_type: 'task_completion', count: '5' },
    { message_type: 'announcement', count: '4' },
    { message_type: 'question', count: '3' },
    { message_type: 'diagnostic', count: '2' },
    { message_type: 'conflict_flag', count: '1' },
  ],
  messages_by_agent: [
    { sender_agent: 'johnny', count: '8' },
    { sender_agent: 'claude', count: '6' },
    { sender_agent: 'replit', count: '5' },
    { sender_agent: 'lovable', count: '3' },
    { sender_agent: 'petro', count: '3' },
  ],
  unacknowledged_high_critical: 2,
  latest_per_agent: [
    { sender_agent: 'johnny', id: 'n1', message_type: 'status_update', subject: 'Daily briefing complete', created_at: '2026-02-12T09:30:00Z' },
    { sender_agent: 'claude', id: 'n2', message_type: 'diagnostic', subject: 'System health check', created_at: '2026-02-12T09:15:00Z' },
    { sender_agent: 'replit', id: 'n3', message_type: 'task_completion', subject: 'API v2.3 deployed', created_at: '2026-02-12T08:45:00Z' },
    { sender_agent: 'lovable', id: 'n4', message_type: 'announcement', subject: 'Dashboard v2 ready', created_at: '2026-02-12T08:30:00Z' },
    { sender_agent: 'petro', id: 'n5', message_type: 'task_assignment', subject: 'Q1 deliverables', created_at: '2026-02-12T08:00:00Z' },
  ],
};

export const seedTeamRoster = [
  { name: 'johnny', role: 'Sales Expert', domain: 'Sales logic, leads, CIA profiles, customer engagement' },
  { name: 'claude', role: 'Local Admin', domain: 'System administration, VPS commands, file operations' },
  { name: 'replit', role: 'Tech Wizard', domain: 'Code, infrastructure, APIs, deployment' },
  { name: 'lovable', role: 'UI/UX Wizard', domain: 'Frontend design, dashboards, user experience' },
  { name: 'petro', role: 'Owner', domain: 'Strategic decisions, approvals, business direction' },
];

export const seedProposals = [
  {
    id: 'prop1', title: 'API Gateway Architecture', description: 'Implement an API gateway for routing and rate limiting', status: 'approved', created_at: '2026-02-05T10:00:00Z',
    boxes: [
      { id: 'b1', label: 'Client Apps', x: 50, y: 50, width: 150, height: 60, color: '#ffbf00' },
      { id: 'b2', label: 'API Gateway', x: 250, y: 50, width: 150, height: 60, color: '#00ffd5' },
      { id: 'b3', label: 'Meeting Hub', x: 450, y: 20, width: 150, height: 60, color: '#a78bfa' },
      { id: 'b4', label: 'Neuron Bus', x: 450, y: 100, width: 150, height: 60, color: '#ec4899' },
    ],
    connections: [
      { from: 'b1', to: 'b2' },
      { from: 'b2', to: 'b3' },
      { from: 'b2', to: 'b4' },
    ],
  },
  {
    id: 'prop2', title: 'Agent Communication Flow', description: 'Design the neuron message routing between agents', status: 'proposed', created_at: '2026-02-08T14:00:00Z',
    boxes: [
      { id: 'b5', label: 'Johnny', x: 50, y: 50, width: 120, height: 50, color: '#ffbf00' },
      { id: 'b6', label: 'Claude', x: 220, y: 50, width: 120, height: 50, color: '#00ffd5' },
      { id: 'b7', label: 'Neuron Hub', x: 135, y: 150, width: 120, height: 50, color: '#a78bfa' },
      { id: 'b8', label: 'Replit', x: 390, y: 50, width: 120, height: 50, color: '#a78bfa' },
    ],
    connections: [
      { from: 'b5', to: 'b7' },
      { from: 'b6', to: 'b7' },
      { from: 'b7', to: 'b8' },
    ],
  },
];

export const seedDatabaseMetrics = {
  database_size: { bytes: 52428800, mb: 50.0, formatted: '50.00 MB' },
  tables: [
    { table_name: 'neuron_messages', row_count: 89, dead_rows: 0 },
    { table_name: 'meeting_turns', row_count: 230, dead_rows: 2 },
    { table_name: 'meetings', row_count: 15, dead_rows: 0 },
    { table_name: 'meeting_action_items', row_count: 45, dead_rows: 1 },
    { table_name: 'meeting_decisions', row_count: 12, dead_rows: 0 },
    { table_name: 'knowledge_timeline', row_count: 150, dead_rows: 3 },
    { table_name: 'meeting_audit_log', row_count: 320, dead_rows: 5 },
    { table_name: 'job_executions', row_count: 67, dead_rows: 0 },
  ],
  recent_activity_by_day: [
    { day: '2026-02-12', events: '15' },
    { day: '2026-02-11', events: '22' },
    { day: '2026-02-10', events: '18' },
  ],
};

export const seedRecentAudit = [
  { id: 'aud1', meeting_id: 'm2', actor_type: 'system', actor_id: 'api', action: 'meeting_started', details: {}, created_at: '2026-02-12T09:00:00Z' },
  { id: 'aud2', meeting_id: 'm2', actor_type: 'system', actor_id: 'api', action: 'turn_added', details: { turn_type: 'statement' }, created_at: '2026-02-12T09:05:00Z' },
  { id: 'aud3', meeting_id: null, actor_type: 'system', actor_id: 'cron', action: 'workflow_completed', details: { workflow: 'johnny-workflow' }, created_at: '2026-02-12T09:00:05Z' },
  { id: 'aud4', meeting_id: 'm1', actor_type: 'system', actor_id: 'api', action: 'meeting_ended', details: {}, created_at: '2026-02-01T12:00:00Z' },
];

export const seedBlockedTasks = [
  { id: 'bt1', title: 'Deploy PgBouncer', assigned_agent: 'replit', priority: 'high', status: 'pending', blocker: 'Waiting for database migration conflict resolution' },
  { id: 'bt2', title: 'Update sales deck', assigned_agent: 'johnny', priority: 'medium', status: 'pending', blocker: 'Pending approval from Petro' },
];
