import React, { useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { api, withFallback } from '../lib/api';
import { AGENT_COLORS } from '../lib/constants';
import { seedMeetingDetail, seedAgentWorkload, seedBlockedTasks } from '../lib/seed-data';
import GlassCard from '../components/GlassCard';
import AgentAvatar from '../components/AgentAvatar';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

const COLUMNS = [
  { key: 'pending', label: 'Pending', color: '#f59e0b' },
  { key: 'in_progress', label: 'In Progress', color: '#ffbf00' },
  { key: 'completed', label: 'Done', color: '#10b981' },
  { key: 'cancelled', label: 'Cancelled', color: '#666666' },
];

export default function TaskBoard() {
  const fetchWorkload = useCallback(
    () => withFallback(() => api<any[]>('/api/meeting-hub/analytics/agent-workload'), seedAgentWorkload),
    []
  );
  const fetchBlocked = useCallback(
    () => withFallback(() => api<any[]>('/api/tasks/blocked'), seedBlockedTasks),
    []
  );

  const { data: workload } = usePolling(fetchWorkload, 30000);
  const { data: blocked } = usePolling(fetchBlocked, 30000);

  const allTasks = seedMeetingDetail.action_items;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-accent-primary">Task Board</h1>

      <div className="grid lg:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const tasks = allTasks.filter(t => t.status === col.key);
          return (
            <div key={col.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="text-sm font-semibold text-text-primary">{col.label}</h3>
                <span className="text-xs text-text-muted">({tasks.length})</span>
              </div>
              <div className="space-y-3">
                {tasks.map(task => {
                  const color = AGENT_COLORS[task.assigned_agent || ''] || '#999';
                  return (
                    <GlassCard key={task.id} className="!p-4">
                      <h4 className="text-sm font-medium text-text-primary mb-2">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-text-secondary mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        {task.assigned_agent && (
                          <AgentAvatar name={task.assigned_agent} size="sm" showName />
                        )}
                        <PriorityBadge priority={task.priority} />
                      </div>
                      {task.due_date && (
                        <p className="text-xs text-text-muted mt-2">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </GlassCard>
                  );
                })}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-text-muted text-sm border border-dashed border-accent-primary/10 rounded-xl">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4">Agent Workload</h2>
          <div className="space-y-3">
            {(workload || seedAgentWorkload).map((agent: any) => {
              const color = AGENT_COLORS[agent.agent] || '#999';
              return (
                <div key={agent.agent} className="flex items-center justify-between p-3 bg-elevated/50 rounded-lg">
                  <AgentAvatar name={agent.agent} size="sm" showName />
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-success">{agent.done} done</span>
                    <span className="text-accent-primary">{agent.in_progress} wip</span>
                    <span className="text-text-muted">{agent.pending} pending</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-error mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Blocked Tasks
          </h2>
          <div className="space-y-3">
            {(blocked || seedBlockedTasks).map((task: any) => (
              <div key={task.id} className="p-3 bg-elevated/50 rounded-lg border-l-3 border-error">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-text-primary">{task.title}</h4>
                  <PriorityBadge priority={task.priority} />
                </div>
                {task.assigned_agent && (
                  <div className="mb-1">
                    <AgentAvatar name={task.assigned_agent} size="sm" showName />
                  </div>
                )}
                <p className="text-xs text-error/80">{task.blocker}</p>
              </div>
            ))}
            {(!blocked || blocked.length === 0) && (
              <p className="text-center text-text-muted py-4">No blocked tasks</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
