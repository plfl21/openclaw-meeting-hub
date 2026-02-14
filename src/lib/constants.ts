export const AGENT_COLORS: Record<string, string> = {
  johnny: '#ffbf00',
  claude: '#00ffd5',
  replit: '#a78bfa',
  lovable: '#ec4899',
  petro: '#10b981',
};

export const AGENT_ROLES: Record<string, string> = {
  johnny: 'Sales Expert',
  claude: 'Local Admin',
  replit: 'Tech Wizard',
  lovable: 'UI/UX Wizard',
  petro: 'Owner',
};

export const AGENT_DOMAINS: Record<string, string> = {
  johnny: 'Sales logic, leads, CIA profiles, customer engagement',
  claude: 'System administration, VPS commands, file operations',
  replit: 'Code, infrastructure, APIs, deployment',
  lovable: 'Frontend design, dashboards, user experience',
  petro: 'Strategic decisions, approvals, business direction',
};

export const STATUS_COLORS: Record<string, string> = {
  draft: '#666666',
  in_progress: '#ffbf00',
  completed: '#10b981',
  cancelled: '#ef4444',
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  proposed: '#a78bfa',
  running: '#00ffd5',
  failed: '#ef4444',
  healthy: '#10b981',
  degraded: '#f59e0b',
  down: '#ef4444',
};

export const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#ffbf00',
  normal: '#999999',
  low: '#666666',
  medium: '#f59e0b',
};

export const MESSAGE_TYPES = [
  'status_update',
  'task_assignment',
  'task_completion',
  'conflict_flag',
  'briefing',
  'question',
  'response',
  'announcement',
  'diagnostic',
  'handoff',
] as const;

export const MEETING_TYPES = [
  'general',
  'standup',
  'planning',
  'review',
  'retrospective',
  'decision',
  'brainstorm',
] as const;
