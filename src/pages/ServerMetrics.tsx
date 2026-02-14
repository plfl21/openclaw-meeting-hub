import React, { useCallback } from 'react';
import { Server, Database, Activity, Cpu, HardDrive } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { api, withFallback } from '../lib/api';
import { seedServerHealth, seedWorkflows, seedDatabaseMetrics, seedJobExecutions } from '../lib/seed-data';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';

export default function ServerMetrics() {
  const fetchServer = useCallback(() => withFallback(() => api<any>('/api/metrics/server'), seedServerHealth), []);
  const fetchWorkflows = useCallback(() => withFallback(() => api<any>('/api/metrics/workflows'), seedWorkflows), []);
  const fetchDatabase = useCallback(() => withFallback(() => api<any>('/api/metrics/database'), seedDatabaseMetrics), []);

  const { data: server } = usePolling(fetchServer, 15000);
  const { data: workflows } = usePolling(fetchWorkflows, 30000);
  const { data: database } = usePolling(fetchDatabase, 60000);

  const sv = server || seedServerHealth;
  const wf = workflows || seedWorkflows;
  const db = database || seedDatabaseMetrics;

  const healthColor = sv.status === 'healthy' ? '#10b981' : sv.status === 'degraded' ? '#f59e0b' : '#ef4444';
  const memPct = sv.memory ? Math.round((sv.memory.heap_used_mb / sv.memory.heap_total_mb) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-accent-primary">Server Metrics</h1>

      <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: `${healthColor}15`, border: `1px solid ${healthColor}30` }}>
        <div className="flex items-center gap-3">
          <Server className="w-6 h-6" style={{ color: healthColor }} />
          <div>
            <h2 className="text-lg font-bold" style={{ color: healthColor }}>
              Server {sv.status?.toUpperCase()}
            </h2>
            <p className="text-sm text-text-secondary">Uptime: {sv.uptime_formatted || 'N/A'}</p>
          </div>
        </div>
        <div className="text-right text-sm text-text-secondary">
          <p>Node {sv.node_version}</p>
          <p className="capitalize">{sv.platform} / {sv.env}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-accent-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Memory Usage</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Heap Used</span>
              <span>{sv.memory?.heap_used_mb || 0} / {sv.memory?.heap_total_mb || 0} MB</span>
            </div>
            <div className="w-full h-3 bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${memPct}%`, backgroundColor: memPct > 80 ? '#ef4444' : memPct > 60 ? '#f59e0b' : '#10b981' }}
              />
            </div>
            <p className="text-xs text-text-muted">RSS: {sv.memory?.rss_mb || 0} MB | External: {sv.memory?.external_mb || 0} MB</p>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-accent-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">CPU Time</h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-accent-secondary">{((sv.cpu?.user_ms || 0) / 1000).toFixed(1)}s</p>
            <p className="text-xs text-text-secondary">User: {sv.cpu?.user_ms || 0}ms</p>
            <p className="text-xs text-text-muted">System: {sv.cpu?.system_ms || 0}ms</p>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-accent-tertiary" />
            <h3 className="text-sm font-semibold text-text-primary">Database</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${sv.database?.connected ? 'bg-success' : 'bg-error'}`} />
              <span className="text-sm text-text-primary">{sv.database?.connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <p className="text-xs text-text-secondary">PG {sv.database?.pg_version || 'N/A'}</p>
            <p className="text-xs text-text-muted">Size: {db.database_size?.formatted || 'N/A'}</p>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-5 h-5 text-success" />
            <h3 className="text-sm font-semibold text-text-primary">Workflows</h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-success">{wf.summary?.success_rate_pct || 0}%</p>
            <p className="text-xs text-text-secondary">Success Rate</p>
            <p className="text-xs text-text-muted">
              {wf.summary?.completed || 0}/{wf.summary?.total || 0} completed | Avg: {wf.summary?.avg_duration_formatted || 'N/A'}
            </p>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4">Table Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-accent-primary/10">
                  <th className="py-2 pr-4">Table</th>
                  <th className="py-2 pr-4 text-right">Rows</th>
                  <th className="py-2 text-right">Dead Rows</th>
                </tr>
              </thead>
              <tbody>
                {(db.tables || seedDatabaseMetrics.tables).map((t: any) => (
                  <tr key={t.table_name} className="border-b border-accent-primary/5 hover:bg-elevated/30">
                    <td className="py-2 pr-4 font-mono text-xs text-text-primary">{t.table_name}</td>
                    <td className="py-2 pr-4 text-right text-text-secondary">{t.row_count}</td>
                    <td className="py-2 text-right text-text-muted">{t.dead_rows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4">Recent Workflow Executions</h2>
          <div className="space-y-2">
            {(wf.recent_executions || seedWorkflows.recent_executions).map((exec: any) => (
              <div key={exec.id} className="p-3 bg-elevated/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono text-text-primary">{exec.workflow_name}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(exec.started_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary">{exec.duration_ms ? `${(exec.duration_ms / 1000).toFixed(1)}s` : '-'}</span>
                  <StatusBadge status={exec.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {sv.table_counts && (
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold text-accent-primary mb-4">Record Counts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(sv.table_counts).map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-elevated/50 rounded-lg">
                <p className="text-2xl font-bold text-accent-secondary">{String(value)}</p>
                <p className="text-xs text-text-muted mt-1">{key.replace(/_count$/, '').replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
